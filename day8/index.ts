import { run } from "../common";

type Instructions = Array<[string, number]>;

function parse(str: string): Instructions {
  return str
    .trim()
    .split("\n")
    .map((line) => {
      const [operation, arg] = line.split(" ");

      return [operation, Number(arg)];
    });
}

function makeProgram(instructions: Instructions) {
  let accumulator = 0;
  let instructionPointer = 0;

  return {
    get acc() {
      return accumulator;
    },
    get instructionPointer() {
      return instructionPointer;
    },
    get done() {
      return instructionPointer === instructions.length;
    },
    makeSnapshot() {
      return { accumulator, instructionPointer };
    },
    loadSnapshot(snapshot: any) {
      accumulator = snapshot.accumulator;
      instructionPointer = snapshot.instructionPointer;
    },
    next() {
      const [operation, arg] = instructions[instructionPointer];

      switch (operation) {
        case "acc":
          console.log(instructionPointer, operation, arg);
          accumulator += arg;
          instructionPointer++;
          return;
        case "jmp":
          console.log(instructionPointer, operation, arg);
          instructionPointer += arg;
          return;
        case "nop":
          instructionPointer++;
          return;
      }
    },
  };
}

type Program = ReturnType<typeof makeProgram>;
function runProgram(program: Program) {
  const executed: number[] = [];

  while (!program.done) {
    const ip = program.instructionPointer;
    executed[ip] = (executed[ip] || 0) + 1;
    if (executed[ip] > 1) {
      // loop detected
      return "loop";
    }

    program.next();
  }
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `
nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6
    `,
    exampleOutput: 5,
    part1(input: Instructions) {
      const program = makeProgram(input);

      runProgram(program);
      return program.acc;
    },
    part2Input: `
nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6
    `,
    part2Output: 8,
    // To solve part 2 I logged all jmp/nop and then manually changed the last
    // one it visited, then moved backward changing them.// To solve part 2 I logged all /nop and then manually changed the last one it visitedacc
    part2(input: Instructions) {
      const program = makeProgram(input);

      console.log(runProgram(program));
      return program.acc;
    },
    dir: __dirname,
  });
}
