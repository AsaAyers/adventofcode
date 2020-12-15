import { run } from "../common";

type MaskInstruction = {
  type: "mask";
  mask: string;
};
type MemInstruction = {
  type: "mem";
  mem: number;
  value: string;
  decimal: number;
};

type Instruction = MaskInstruction | MemInstruction;

function parseInput(str: string): Instruction[] {
  return str
    .trim()
    .split("\n")
    .map((line) => {
      const [left, value] = line.split(/\s*=\s*/);

      const memMatch = left.match(/mem\[(\d+)\]/);
      if (memMatch) {
        return {
          type: "mem",
          mem: Number(memMatch[1]),
          value: value,
          decimal: Number(value),
        };
      } else if (left === "mask") {
        return {
          type: "mask",
          mask: value,
        };
      } else {
        throw new Error(`Error parsing line: ${line}`);
      }
    });
}

if (require.main === module) {
  console.clear();
  run({
    parse: parseInput,
    exampleInput: `
    mask = XXXXXXXXXXXXXXXXXXXXXXXXXXXXX1XXXX0X
mem[8] = 11
mem[7] = 101
mem[8] = 0
    `,
    exampleOutput: 165,
    part1(input) {
      console.log(input);

      const parseBitmask = (mask: string) => {
        return mask
          .split("")
          .reverse()
          .reduce((foo, bit, address) => {
            if (bit === "1" || bit === "0") {
              foo.push({
                address,
                bit,
              });
            }
            return foo;
          }, [] as any);
      };
      let bitMask: Array<{ address: number; bit: string }> = parseBitmask("");
      const mem: number[] = [];

      const applyMask = (input: number): number => {
        const bits = bitMask.reduce((n, { address, bit }) => {
          console.log("mask", address, bit);
          n[address] = bit;
          return n;
        }, input.toString(2).split("").reverse());
        bits.reverse();

        let assembledString = "";
        for (let i = 0; i < bits.length; i++) {
          assembledString += bits[i] || "0";
        }

        const x = parseInt(assembledString, 2);
        console.log("masked?", {
          input: input.toString(2),
          bits,
          assembledString,
          x,
        });
        return x;
      };

      input.forEach((instruction) => {
        switch (instruction.type) {
          case "mask":
            bitMask = parseBitmask(instruction.mask);
            console.log("mask", bitMask);
            break;
          case "mem":
            mem[instruction.mem] = applyMask(instruction.decimal);
            console.log(
              `mem[${instruction.mem}] = ${mem[instruction.mem]} (${
                instruction.decimal
              })`
            );
        }
      });

      console.log(mem);
      return mem.reduce((a, b) => a + b);
    },
    part2Input: ``,
    part2Output: 1,
    part2(input) {
      console.log(input);
      return 0;
    },
    dir: __dirname,
  });
}
