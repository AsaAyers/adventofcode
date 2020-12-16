import fs from "fs";
import path from "path";
import util from "util";

export const readInputFile = (dir: string) => {
  const inputStr = String(fs.readFileSync(path.join(dir, "input.txt")));
  if (!inputStr) {
    throw new Error("input.txt is empty");
  }
  return inputStr;
};

type TestParams<T = string[], E = number> = {
  label: string;
  input?: string;
  parse: (str: string) => T | Promise<T>;
  func: (input: T) => E | Promise<E>;
  expect?: E;
};

const registeredTests: TestParams<any, any>[] = [];

export function test<T = string[], E = number>(testParams: TestParams<T, E>) {
  registeredTests.push(testParams);
}

export async function runTests(dir: string) {
  console.clear();
  let error = false;
  for (let i = 0; error === false && i < registeredTests.length; i++) {
    const {
      label,
      parse,
      expect,
      func,
      input = readInputFile(dir),
    } = registeredTests[i];
    console.log(`===== ${label} =====`);
    const actual = await func(await parse(input));
    if (expect !== undefined && actual !== expect) {
      console.log(
        `${label}\nActual: ${util.inspect(actual)}\nExpected: ${util.inspect(
          expect
        )} `
      );
      error = true;
    } else {
      console.log(label, "Answer:", actual);
    }
  }
}

type Day<Data, Output> = {
  parse(str: string): Data | Promise<Data>;
  exampleInput: string;
  exampleOutput: Output;
  part2Input?: string;
  part2Output?: Output;
  part1(input: Data, isExample?: boolean): Output | Promise<Output>;
  part2(input: Data, isExample?: boolean): Output | Promise<Output>;
  dir: string;
};
export async function run<Data, Output>({
  parse,
  exampleInput,
  exampleOutput,
  part1,
  part2,
  part2Input,
  part2Output,
  dir,
}: Day<Data, Output>) {
  test<Data, Output>({
    label: "exampleInput",
    parse,
    input: exampleInput,
    expect: exampleOutput,
    func: (i) => part1(i, true),
  });

  test<Data, Output>({
    label: "Part 1",
    parse,
    func: (i) => part1(i, false),
  });

  test<Data, Output>({
    label: "Part 2 Example",
    parse,
    input: part2Input || exampleInput,
    expect: exampleOutput,
    func: (i) => part2(i, true),
  });

  test<Data, Output>({
    label: "Part 2",
    parse,
    expect: part2Output || exampleOutput,
    func: (i) => part2(i, false),
  });

  return runTests(dir);
}
