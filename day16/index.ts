import { runTests, test } from "../common";

type Rule = {
  name: string;
  ranges: Array<[number, number]>;
};

type Ticket = number[];

function parse(str: string) {
  const lines = str.trim().split("\n");

  const rules: Rule[] = [];
  let myTicket: Ticket = [];
  const nearybTickets: Ticket[] = [];
  let step = "rules";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    switch (step) {
      case "rules": {
        const match = line.match(/([\w\s]+): (\d+-\d+) or (\d+-\d+)/);
        if (match) {
          const [, name, range1, range2] = match;
          rules.push({
            name,
            ranges: [
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              range1.split("-").map(Number),
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              range2.split("-").map(Number),
            ],
          });
          break;
        }
        step = "my ticket";
      }
      // eslint-disable-next-line no-fallthrough
      case "my ticket": {
        const match = line.match(/[\d,]+/);
        if (match) {
          myTicket = line.split(",").map(Number);
          step = "nearby";
        }
        break;
      }
      case "nearby": {
        const match = line.match(/[\d,]+/);
        if (match) {
          nearybTickets.push(line.split(",").map(Number));
        }
      }
    }
  }

  return { rules, myTicket, nearybTickets };
}
type Input = ReturnType<typeof parse>;

function matchesRule(n: number, rule: Rule) {
  return rule.ranges.some(([min, max]) => min <= n && n <= max);
}

function findInvalidNumbers(rules: Rule[], ticket: Ticket) {
  return ticket.filter((n) => {
    const matchesAnyRule = rules.some((rule) => {
      return matchesRule(n, rule);
    });

    if (!matchesAnyRule) {
      return true;
    }
    return false;
  });
}

const sum = (a: number, b: number) => a + b;

function part1({ rules, nearybTickets }: Input): any {
  // return isValidTicket(input.rules, input.myTicket);
  return nearybTickets.flatMap((t) => findInvalidNumbers(rules, t)).reduce(sum);
}

function solveTicketPositions({ rules, nearybTickets, myTicket }: Input): any {
  const validTickets = nearybTickets.filter(
    (t) => findInvalidNumbers(rules, t).length === 0
  );

  // Walk all the rules
  const possibleRuleIndexes = rules.reduce((p, rule) => {
    // For each rule, which positions could it match on each ticket?
    const ticketPositions = validTickets.map((ticket) => {
      const possiblePositions = ticket.flatMap((number, i) => {
        if (matchesRule(number, rule)) {
          return [i];
        }
        return [];
      });

      return possiblePositions;
    });
    // console.log(ticketPositions);

    // What positions are common to ALL the tickets?
    const firstTicket = ticketPositions[0];
    const f = firstTicket.filter((index) => {
      return ticketPositions.every((ticket) => ticket.includes(index));
    });

    p[rule.name] = f;
    return p;
  }, {} as Record<string, number[]>);

  const reservedNumbers: number[] = [];
  const settledRules: Record<string, number> = {};

  const ruleKeys = Object.keys(possibleRuleIndexes);

  while (reservedNumbers.length < ruleKeys.length) {
    for (let i = 0; i < ruleKeys.length; i++) {
      const key = ruleKeys[i];
      const r = (possibleRuleIndexes[key] = possibleRuleIndexes[key].filter(
        (position) => !reservedNumbers.includes(position)
      ));

      if (r.length === 1) {
        reservedNumbers.push(r[0]);
        settledRules[key] = r[0];
      }
    }
  }

  return Object.entries(settledRules).map(([ruleName, index]) => {
    return [ruleName, myTicket[index]];
  });
}

function part2(input: Input): any {
  const myTicket: Array<[string, number]> = solveTicketPositions(input);

  return myTicket
    .flatMap(([rule, value]) => {
      if (rule.indexOf("departure") === 0) {
        return [value];
      }
      return [];
    })
    .reduce((a, b) => a * b);
}

if (require.main === module) {
  console.clear();
  const part1Example = `
  
class: 1-3 or 5-7
row: 6-11 or 33-44
seat: 13-40 or 45-50

your ticket:
7,1,14

nearby tickets:
7,3,47
40,4,50
55,2,20
38,6,12

  `;
  const part2Example = `
class: 0-1 or 4-19
row: 0-5 or 8-19
seat: 0-13 or 16-19

your ticket:
11,12,13

nearby tickets:
3,9,18
15,1,5
5,14,9

  `;
  test({
    label: "exampleInput",
    parse,
    input: part1Example,
    expect: 71,
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
    expect: JSON.stringify([
      ["seat", 13],
      ["class", 12],
      ["row", 11],
    ]),
    func: (input) => JSON.stringify(solveTicketPositions(input)),
  });

  test({
    label: "Part 2",
    parse,
    func: part2,
  });

  runTests(__dirname);
}
