import { run } from "../common";

type Instructions = ReadonlyArray<[string, number]>;

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
    peekOp() {
      const [operation] = instructions[instructionPointer];
      return operation;
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
          // console.log(instructionPointer, operation, arg, accumulator);
          accumulator += arg;
          instructionPointer++;
          return;
        case "jmp":
          // console.log(instructionPointer, operation, arg);
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
  const ipHistory: number[] = [];
  const snapshots: any[] = [];

  while (!program.done) {
    const ip = program.instructionPointer;
    // loop detected
    if (ipHistory.includes(ip)) {
      console.log("loop at instruction", ip);
      break;
    }
    ipHistory.push(ip);
    snapshots.push(program.makeSnapshot());

    program.next();
  }
  return snapshots;
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
    // one it visited, then moved backward changing them.
    part2(input: Instructions) {
      const program = makeProgram(input);
      const snapshots = runProgram(program);
      // console.log(
      //   input.map(([op, arg], index) => `${index}: ${op} ${arg}`).join("\n")
      // );
      // console.log(snapshots);

      while (!program.done && snapshots.length > 0) {
        const snapshot = snapshots.pop();

        // program won't run again, I'm just using to read the snapshots. Even
        // though this snapshot only has 2 items, I like treating it as if it's
        // opaque.
        program.loadSnapshot(snapshot);
        const op = program.peekOp();
        const ip = program.instructionPointer;
        switch (op) {
          case "jmp":
          case "nop": {
            const instructions = [...input];

            const [original, arg] = instructions[ip];
            instructions[ip] = original === "nop" ? ["jmp", arg] : ["nop", arg];
            console.log(`flipped ${original} at ${ip} to ${instructions[ip]}`);
            const tmpProgram = makeProgram(instructions);
            runProgram(tmpProgram);
            if (tmpProgram.done) {
              console.log("finished");
              return tmpProgram.acc;
            }
          }
        }
      }

      return program.acc;
    },
    dir: __dirname,
  });
}
