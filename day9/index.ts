import { run } from "../common";

function parse(str: string) {
  return str.trim().split("\n").map(Number);
}

function xmas(preambleLength: number, data: number[]) {
  for (let i = preambleLength; i < data.length; i++) {
    const target = data[i];
    const window = data.slice(i - preambleLength, i);
    const result = window.find((item) => window.includes(target - item));

    // console.log(i, target, window, result);
    if (!result) {
      return target;
    }
  }
  return 0;
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `
      35
  20
  15
  25
  47
  40
  62
  55
  65
  95
  102
  117
  150
  182
  127
  219
  299
  277
  309
  576
      `,
    exampleOutput: 127,
    part1(input, isExample) {
      // console.log(input);
      const preamble = isExample ? 5 : 25;
      return xmas(preamble, input);
    },
    part2Input: ``,
    part2Output: 62,
    part2(input, isExample) {
      // console.log(input);
      const preamble = isExample ? 5 : 25;
      const invalid = xmas(preamble, input);

      let longestRange: number[] = [];
      for (
        let head = 0, tail = 0, sum = 0, range: number[] = [];
        head < input.length;
        head++
      ) {
        while (sum < invalid) {
          range.push(input[tail]);
          sum += input[tail++];
        }

        if (sum === invalid) {
          if (range.length > longestRange.length) {
            console.log("longestRange =", sum, range);
            longestRange = [...range];
          }
        }
        sum -= range.shift() || 0;
      }

      const min = Math.min(...longestRange);
      const max = Math.max(...longestRange);

      return min + max;
    },
    dir: __dirname,
  });
}
