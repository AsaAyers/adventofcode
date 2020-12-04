import fs from "fs";
import path from "path";

type Day<Data, Output> = {
  parse(str: string): Data | Promise<Data>;
  exampleInput: string;
  exampleOutput: Output;
  part2Input?: string;
  part2Output?: Output;
  part1(input: Data): Output | Promise<Output>;
  part2(input: Data): Output | Promise<Output>;
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
  const value = await part1(await parse(exampleInput));
  if (value === exampleOutput) {
    const inputStr = String(fs.readFileSync(path.join(dir, "input.txt")));
    if (!inputStr) {
      throw new Error("input.txt is empty");
    }

    const myInput = await parse(inputStr);

    console.log("Part1:");
    console.log(await part1(myInput));

    if (part2Output) {
      const value = await part2(await parse(part2Input || exampleInput));

      if (value !== part2Output) {
        console.log("Part 2");
        console.log(`Actual:`, value);
        console.log(`Expected:`, part2Output);
        return;
      }
      console.log("Part2:");
      console.log(await part2(myInput));
    }
  } else {
    console.log("Part 1");
    console.log(`Actual:`, value);
    console.log(`Expected:`, exampleOutput);
  }
}
