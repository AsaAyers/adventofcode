import { runTests, sum, test } from "../common";

function parse(str: string) {
  return str
    .trim()
    .split("\n")
    .map((line) => {
      return line;
    });
}
type Input = ReturnType<typeof parse>;

function evaluate(str: string): number {
  let acc: number | undefined;
  console.log("evaluate", str);

  if (str.includes("(")) {
    let subExpression = "";
    let parens = 0;
    let start = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === "(") {
        if (parens === 0) {
          start = i;
        }
        parens++;
      } else if (char === ")") {
        parens--;

        if (parens === 0) {
          const prefix = str.slice(0, start);
          const subExpression = str.slice(start + 1, i);
          const suffix = str.slice(i + 1);

          console.log({ prefix, subExpression, suffix });
          const value = evaluate(subExpression);
          return evaluate(`${prefix}${value}${suffix}`);
        }
      }
      subExpression += char;
    }

    return 0;
  }

  let operation: "+" | "*" | undefined;
  const digitRegEx = /\d/;
  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    // console.log(char, acc, operation);

    if (char === "(") {
      for (i = i + 1; i < str.length; i++) {
        char = str[i];
      }
    }

    if (char.match(digitRegEx)) {
      while (i + 1 < str.length && str[i + 1].match(digitRegEx)) {
        i++;
        char += str[i];
      }

      if (acc === undefined) {
        acc = Number(char);
        continue;
      }

      switch (operation) {
        case "+":
          acc += Number(char);
          break;
        case "*":
          acc *= Number(char);
          break;
        case undefined:
          throw new Error("Missing operation");
      }
    } else if (char === "+" || char === "*") {
      operation = char;
    }
  }
  console.log("        ", str, acc);
  return acc!;
}

function part1(input: Input): any {
  return input.map(evaluate).reduce((a, b) => a + b, 0);
}
function part2(input: Input): any {
  return 0;
}

if (require.main === module) {
  console.clear();
  const part1Example = ` 1 + 2 * 3 + 4 * 5 + 6 `;
  const part2Example = ``;
  test({
    label: "exampleInput",
    parse,
    input: part1Example,
    expect: 71,
    func: part1,
  });
  test({
    label: "exampleInput",
    parse,
    input: ` 1 + (2 * 3) + (4 * (5 + 6)): `,
    expect: 51,
    func: part1,
  });

  test({
    label: "Part 1",
    parse,
    func: part1,
  });

  test({
    label: "Part 2 Example",
    parse,
    input: part2Example || part1Example,
    expect: 0,
    func: part2,
  });

  test({
    label: "Part 2",
    parse,
    func: part2,
  });

  runTests(__dirname);
}
