import { run } from "../common";

type Item = {
  password: string;
  policyCharacter: string;
  min: number;
  max: number;
};
type Data = Array<Item>;
type Output = number;

function parse(str: string): Data {
  const regex = /^(\d+)-(\d+) (.): (.*)$/;

  return str
    .trim()
    .split("\n")
    .map(
      (line): Item => {
        const data = line.match(regex);
        if (!data) {
          throw new Error(`Failed to parse: '${line}'`);
        }

        const [_, min, max, policyCharacter, password] = data;
        return {
          min: Number(min),
          max: Number(max),
          policyCharacter,
          password,
        };
      }
    )
    .filter(Boolean);
}

const exampleInput = `
1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc
`;
// How many passwords are valid according to their policies?
const exampleOutput: Output = 2;

function countChar(input: string, char: string, start = 0): number {
  const index = input.indexOf(char, start);
  if (index === -1) {
    return 0;
  }
  return 1 + countChar(input, char, index + 1);
}

function isValid({ min, max, policyCharacter, password }: Item): boolean {
  const numFound = countChar(password, policyCharacter);
  return min <= numFound && numFound <= max;
}

function part1(input: Data): typeof exampleOutput {
  return input.filter(isValid).length;
}

function part2(input: Data): typeof exampleOutput {
  return input.filter(({ min, max, policyCharacter, password }) => {
    const pos1 = password[min - 1];
    const pos2 = password[max - 1];

    if (pos1 === pos2) {
      return false;
    }
    return pos1 === policyCharacter || pos2 === policyCharacter;
  }).length;
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
