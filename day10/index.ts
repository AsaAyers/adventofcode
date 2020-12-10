import { run } from "../common";

function parse(str: string) {
  return str
    .trim()
    .split("\n")
    .map(Number)
    .sort((a, b) => a - b);
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `
28
33
18
42
31
14
46
20
48
47
24
23
49
45
19
38
39
11
1
32
25
35
8
17
7
9
4
2
34
10
3
    `,
    // 1-hold differences * 3-volt differences
    exampleOutput: 220,
    part1(adapters) {
      // adapters.sort((a, b) => a - b);
      console.log(adapters);
      let joltage = 0;
      let ones = 0;
      let threes = 0;
      for (let i = 0; i < adapters.length; i++) {
        const next = adapters[i];
        const diff = next - joltage;
        joltage = next;
        switch (diff) {
          case 1:
            ones += 1;
            break;
          case 3:
            threes += 1;
            break;
          default:
            console.log("diff?", diff);
        }
        // console.log(`${joltage} => ${next} ${diff} [${ones}, ${threes}]`);
      }

      joltage += 3;
      threes++;
      return ones * threes;
    },
    part2Input: `
       16
    10
    15
    5
    1
    11
    7
    19
    6
    12
    4 `,
    part2Output: 8,
    // part2Output: 19208,
    async part2(input) {
      const sum = (a: number, b: number) => a + b;
      const compatibleAdapters = [0, ...input].reduce(
        (compatibleAdapters, adapter: number, _index, array) => {
          const possibilities = array.filter(
            (p) => p > adapter && p <= adapter + 3
          );
          compatibleAdapters[adapter] = possibilities;
          return compatibleAdapters;
        },
        {} as Record<number, number[]>
      );
      console.log(compatibleAdapters);

      const promiseCache: Record<number, Promise<number>> = {};
      const memoized = (index: number): Promise<number> => {
        if (!promiseCache[index]) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          promiseCache[index] = getBranches(index);
        }
        return promiseCache[index];
      };

      const getBranches = async (index: number): Promise<number> => {
        const possibilities = compatibleAdapters[index];
        console.log("getBranches", index, possibilities);
        if (possibilities.length === 0) {
          // found a leaf node
          return 1;
        }

        const tmp = await Promise.all(possibilities.map(memoized));
        return tmp.reduce(sum);
      };

      return getBranches(0);
    },
    dir: __dirname,
  });
}
