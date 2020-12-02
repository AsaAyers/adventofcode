import { run } from "../common";

type Data = number[];
type Output = number;

function parse(str: string): Data {
  return str.trim().split("\n").map(Number).filter(Boolean);
}

const exampleInput = `
1721
979
366
299
675
1456
`;
const exampleOutput: Output = 514579;

function findPair(target: number, report: number[]) {
  const results: [number, number][] = [];
  for (let index = 0; index < report.length; index++) {
    const a = report[index];
    if (a >= target) {
      continue;
    }
    const b = target - a;

    if (report.includes(b)) {
      results.push([a, b]);
    }
  }
  return results;
}

function part1(input: Data) {
  const pairs = findPair(2020, input);

  return pairs.map(([a, b]) => a * b)[0];
}

function part2(input: Data): typeof exampleOutput {
  const results: [number, number, number][] = [];
  for (let i = 0; i < input.length; i++) {
    const a = input[i];
    const remainder = 2020 - a;

    const pairs = findPair(remainder, input);
    for (let j = 0; j < pairs.length; j++) {
      const [b, c] = pairs[j];
      results.push([a, b, c]);
    }
  }

  return results.map(([a, b, c]) => a * b * c)[0];
}

if (require.main === module) {
  run({
    parse,
    exampleInput,
    exampleOutput,
    part1,
    part2,
    dir: __dirname,
  });
}
