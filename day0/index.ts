import { run } from "../common";

function parse(str: string) {
  return str
    .trim()
    .split("\n")
    .map((line) => {
      return line.split("");
    });
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: ``,
    exampleOutput: 0,
    part1(input) {
      console.log(input);
      return 0;
    },
    part2Input: ``,
    part2Output: 1,
    part2(input) {
      console.log(input);
      return 1;
    },
    dir: __dirname,
  });
}
