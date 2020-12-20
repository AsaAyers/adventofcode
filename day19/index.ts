import { runTests, sum, test } from "../common";

type RuleId = string;
type Rules = Record<RuleId, Rule>;

function parse(str: string): { rules: Rules; lines: string[] } {
  const ruleRegex = /(\d+): ("(\w)"|[\d\s]+)(\| ([\d\s]+))?/;

  const rules: Rules = {};

  const lines = str.trim().split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ruleMatch = line.match(ruleRegex);
    if (ruleMatch) {
      const [, id, left, ab, , right] = ruleMatch;
      if (ab) {
        rules[id] = ab;
      } else if (right && left) {
        rules[id] = {
          left: left.trim().split(" "),
          right: right.trim().split(" "),
        };
      } else if (left) {
        rules[id] = left.split(" ");
      }
    } else if (lines[i] == "") {
      return { rules, lines: lines.slice(i + 1) };
    }
  }
  throw new Error("invalid input");
}
type Input = ReturnType<typeof parse>;

function matchLine(rules: Rules, rule: Rule, text: string): false | string {
  // console.log("matchLine", rule, text);
  if (typeof rule === "string") {
    console.log(rule, text);
    if (text.indexOf(rule) === 0) {
      return text.slice(rule.length);
    }
    return false;
  } else if (Array.isArray(rule)) {
    let t = text;
    for (let i = 0; i < rule.length; i++) {
      const result = matchLine(rules, rules[rule[i]], t);
      // console.log(result, rule[i]);
      if (result === false) {
        return false;
      }
      t = result;
    }
    return t;
  } else {
    const { left, right } = rule;

    // console.log("OR", left, right);
    const l = matchLine(rules, left, text);
    if (l === false) {
      const r = matchLine(rules, right, text);
      if (r === false) {
        return false;
      }
      return r;
    }
    return l;
  }
}
type Rule =
  | string
  | string[]
  | {
      left: Rule;
      right: Rule;
    };

function part1(input: Input): any {
  return input.lines
    .map((line) =>
      matchLine(input.rules, input.rules[0], line) === "" ? 1 : 0
    )
    .reduce(sum, 0);
}
function part2(input: Input): any {
  return input;
}

if (require.main === module) {
  console.clear();
  const part1Example = `

0: 4 1 5
1: 2 3 | 3 2
2: 4 4 | 5 5
3: 4 5 | 5 4
4: "a"
5: "b"

ababbb
bababa
abbbab
aaabbb
aaaabbb

  `;
  const part2Example = ``;
  test({
    label: "exampleInput",
    parse,
    input: part1Example,
    expect: 2,
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
