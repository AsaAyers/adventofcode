/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { run } from "../common";

type Rule = {
  bagName: string;
  children: Record<string, number>;
};

function parse(str: string) {
  return str
    .trim()
    .split("\n")
    .map((line) => {
      // console.log(line);
      const match = line.match(/^(\w+ \w+) bags contain (.*)$/);
      const [, bagName, children] = match!;

      const childEntries = children
        .split(", ")
        .map((numBags) => {
          if (numBags === "no other bags.") {
            return [];
          }
          const match = numBags.match(/(^\d) (\w+ \w+) bags?[.,]?/)!;
          // console.log(numBags, match);

          return [match[2], Number(match[1])];
        })
        .filter((e) => e.length === 2);

      return {
        bagName,
        children: Object.fromEntries(childEntries),
      };
    });
}

const myBag = "shiny gold";

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `
light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.

    `,
    exampleOutput: 4,
    part1(rules: Rule[]) {
      // console.log(rules);

      function canHold(child: string): string[][] {
        return rules.flatMap((rule) => {
          if (rule.children[child]) {
            const recursive = canHold(rule.bagName).map((chain) => [
              ...chain,
              child,
            ]);
            return [[rule.bagName, child], ...recursive];
          }
          return [];
        });
      }

      const possibilities = canHold(myBag);
      // console.log("wat");
      // console.log(possibilities);

      // return 0;
      return new Set(possibilities.map((p) => p[0])).size;
    },
    part2Input: `
shiny gold bags contain 2 dark red bags.
dark red bags contain 2 dark orange bags.
dark orange bags contain 2 dark yellow bags.
dark yellow bags contain 2 dark green bags.
dark green bags contain 2 dark blue bags.
dark blue bags contain 2 dark violet bags.
dark violet bags contain no other bags.
 `,
    part2Output: 126,
    part2(rules: Rule[]) {
      // console.log(rules);
      const rulesIndex = Object.fromEntries(
        rules.map((rule) => {
          return [rule.bagName, rule];
        })
      );

      const bagCount: Record<string, number> = {};

      function checkBag(name: string) {
        if (bagCount[name] == null) {
          const rule = rulesIndex[name];
          // console.log("x", rule.bagName);
          // Including itself, how many bags does this bag represent?
          bagCount[name] = Object.entries(rule.children).reduce(
            (total, [child, num]) => {
              const numChildBags = num * checkBag(child);
              return total + numChildBags;
            },
            1
          );
        }
        return bagCount[name];
      }
      console.log(rulesIndex);

      // Subtract 1 because the outer bag doesn't contain itself
      return checkBag(myBag) - 1;
    },
    dir: __dirname,
  });
}
