import { runTests, test } from "../common";

function parse(str: string) {
  return str.split("").map(Number);
}
type Input = ReturnType<typeof parse>;

const findDestination = (
  cups: number[],
  value: number,
  pickUp: number[]
): number => {
  // console.log("findDestination", value);
  const d = cups.findIndex((cup) => !pickUp.includes(cup) && cup === value);

  if (d === -1) {
    const nextValue = (10 + value - 1) % 10;
    return findDestination(cups, nextValue, pickUp);
  }

  if (!d) {
    if (value < 0) {
      value = cups.length;
    }
  }
  return d;
};

function move(currentIndex: number, cups: number[]) {
  // The crab picks up the three cups that are immediately clockwise of the
  // current cup. They are removed from the circle; cup spacing is adjusted as
  // necessary to maintain the circle.
  const pickUp = cups.splice(currentIndex + 1, 3);

  if (pickUp.length !== 3) {
    currentIndex -= 3 - pickUp.length;
    pickUp.push(...cups.splice(0, 3 - pickUp.length));
  }

  // The crab selects a destination cup: the cup with a label equal to the
  // current cup's label minus one. If this would select one of the cups that
  // was just picked up, the crab will keep subtracting one until it finds a
  // cup that wasn't just picked up. If at any point in this process the value
  // goes below the lowest value on any cup's label, it wraps around to the
  // highest value on any cup's label instead.

  const currentValue = cups[currentIndex];
  const dest = findDestination(cups, (currentValue - 1 + 10) % 10, pickUp);

  // console.log(
  //   "cups:",
  //   cups
  //     .map((cup, index) => (index === currentIndex ? `(${cup})` : String(cup)))
  //     .join(",")
  // );
  // console.log("pick up:", pickUp.join(", "));
  // console.log("destination:", cups[dest]);

  // The crab places the cups it just picked up so that they are immediately
  // clockwise of the destination cup. They keep the same order as when they
  // were picked up.
  cups.splice(dest + 1, 0, ...pickUp);

  // The crab selects a new current cup: the cup which is immediately clockwise of the current cup.
  return (cups.indexOf(currentValue) + 1) % cups.length;
}

const cupsIdentifier = (input: number[]) =>
  input
    .slice(input.indexOf(1) + 1)
    .concat(input.slice(0, input.indexOf(1)))
    .join("");

function findRepeat(input: number[]) {
  const cups = [...input];
  let currentIndex = 0;
  const history: string[] = [];
  let max = 0;
  for (let i = 0; i < 10000; i++) {
    const id = cupsIdentifier(cups) + ":" + currentIndex;
    if (history.includes(id)) {
      max = Math.max(max, history.indexOf(id));
      console.log(history.indexOf(id), id);
      // return history.length - history.indexOf(id);
    }

    history.unshift(id);
    // console.log("\nmove", i + 1, "currentIndex:", currentIndex);
    currentIndex = move(currentIndex, cups);
  }
  // console.log("h", history.join("\n"));
  console.log("x", history[2177]);
  console.log("x", history[2177 * 2]);
  console.log("x", history[2177 * 3]);
  return 0;
}

function part1(input: Input): any {
  input = [...input];
  console.log("repeat", findRepeat(input));
  let currentIndex = 0;
  const history: string[] = [];
  for (let i = 0; i < 100; i++) {
    const id = cupsIdentifier(input);

    history.push(id);
    // console.log("\nmove", i + 1, "currentIndex:", currentIndex);
    currentIndex = move(currentIndex, input);
  }

  console.log(input.join(","));
  // console.log(history.join("\n"));

  return cupsIdentifier(input);
}
function part2(input: Input): any {
  input = [...input];
  let currentIndex = 0;
  currentIndex = 0;
  // for (let i = Math.max(...input) + 1; i <= 1000000; i++) {
  //   input.push(i);
  // }
  console.log("repeat", findRepeat(input));
  // for (let i = 0; i < 10000000; i++) {
  //   console.log("\nmove", i + 1, "currentIndex:", currentIndex);
  //   currentIndex = move(currentIndex, input);
  // }
  const a = input[(currentIndex + 1) % input.length];
  const b = input[(currentIndex + 2) % input.length];

  return a * b;
}

if (require.main === module) {
  console.clear();
  const part1Example = `389125467`;
  const part2Example = ``;
  test({
    label: "exampleInput",
    parse,
    input: part1Example,
    expect: "67384529",
    // expect: "92658374",
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
    expect: 149245887792,
    func: part2,
  });

  test({
    label: "Part 2",
    parse,
    func: part2,
  });

  runTests(__dirname);
}
