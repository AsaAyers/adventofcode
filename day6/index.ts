import { run } from "../common";

function parse(str: string): string[][] {
  const lines = str.trim().split("\n");

  // console.log(lines);
  let current: string[] = [];
  const group: string[][] = [];

  group.push(current);
  lines.forEach((line) => {
    if (line === "") {
      current = [];
      group.push(current);
    } else {
      current.push(line);
    }
  });

  return group;
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `
abc

a
b
c

ab
ac

a
a
a
a

b

    `,
    exampleOutput: 11,
    part1(input: string[][]) {
      return input.reduce(
        (total, group) => total + new Set(group.join("")).size,
        0
      );
    },
    // part2Input: ``,
    part2Output: 6,
    part2(input) {
      // console.log(input);
      return input.reduce((total, group) => {
        const first = group[0];

        let count = 0;
        for (let i = 0; i < first.length; i++) {
          const char = first[i];
          if (group.every((t) => t.includes(char))) {
            count++;
          }
        }

        return total + count;
      }, 0);
    },
    dir: __dirname,
  });
}
