import { run } from "../common";

function parse(str: string) {
  return str.trim().split("\n").map(Number).filter(Boolean);
}

if (require.main === module) {
  run({
    parse,
    exampleInput: ``,
    exampleOutput: 4,
    part1(_input) {
      return 0;
    },
    part2(_input) {
      return 1;
    },
    dir: __dirname,
  });
}
