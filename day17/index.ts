import { runTests, test } from "../common";

enum State {
  Active = "#",
  Inactive = ".",
}

type Address = {
  x: number;
  y: number;
  z: number;
  w: number;
};
const parseAddress = (str: string): Address => {
  const [x, y, z, w = 0] = str.split(",");
  return {
    x: Number(x),
    y: Number(y),
    z: Number(z),
    w: Number(w),
  };
};

function parse(str: string) {
  return str
    .trim()
    .split("\n")
    .reduce((map, line, x) => {
      return line.split("").reduce((map, state, y) => {
        const address = `${x},${y},0,0`;

        if (state === State.Active) {
          map.set(address, State.Active);
        }
        return map;
      }, map);
    }, new Map<string, State>());
}
type Input = ReturnType<typeof parse>;

function traverseAdjacent<T>(
  map: Input,
  addr: Address,
  fourthDimension: boolean,
  callback: (state: State, key: string) => T
): T[] {
  const values = [];
  const wMin = fourthDimension ? -1 : 0;
  const wMax = fourthDimension ? 1 : 0;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        for (let w = wMin; w <= wMax; w++) {
          if (x === 0 && y === 0 && z === 0 && w === 0) {
            continue;
          }
          const key = `${addr.x + x},${addr.y + y},${addr.z + z},${addr.w + w}`;
          const state = map.get(key) || State.Inactive;
          values.push(callback(state, key));
        }
      }
    }
  }

  return values;
}

const sum = (a: number, b: number) => a + b;

function countAdjacent(
  key: string,
  map: Input,
  fourthDimension: boolean
): number {
  const addr = parseAddress(key);
  return traverseAdjacent(map, addr, fourthDimension, (state): number =>
    state === State.Active ? 1 : 0
  ).reduce(sum);
}

function printMap(map: Input, fourthDimension: boolean, z = 0): string {
  let out = "";
  for (let x = -1; x < 5; x++) {
    for (let y = -1; y < 5; y++) {
      const key = `${x},${y},${z}`;
      let adjacent = String(countAdjacent(key, map, fourthDimension));
      if (adjacent === "2" || adjacent === "3") {
        // do nothing
      } else {
        adjacent = "";
      }

      out += String(adjacent).padStart(1);
      out += map.get(key) || State.Inactive;
    }
    out += "\n";
  }

  return out;
}

function applyRules(current: Input, fourthDimension: boolean): Input {
  const nextGeneration = new Map<string, State>();

  function processNode(state: State, key: string) {
    // if (nextGeneration.has(key)) {
    //   return;
    // }

    const adjacent = countAdjacent(key, current, fourthDimension);
    // console.log("process", key, state, adjacent);
    if (state === State.Active) {
      if (2 <= adjacent && adjacent <= 3) {
        nextGeneration.set(key, State.Active);
      } else {
        // nextGeneration.set(key, State.Inactive);
      }
    } else if (state === State.Inactive && adjacent === 3) {
      nextGeneration.set(key, State.Active);
    }
  }

  current.forEach((state, key) => {
    const address = parseAddress(key);
    processNode(state, key);
    traverseAdjacent(current, address, fourthDimension, processNode);
  });
  return nextGeneration;
}

function part1(input: Input, fourthDimension = false): any {
  let current = input;
  console.log(printMap(input, fourthDimension));

  const generations = 6;
  for (let i = 0; i < generations; i++) {
    current = applyRules(current, fourthDimension);
  }

  let active = 0;
  current.forEach((state) => {
    if (state === State.Active) {
      active++;
    }
  });

  return active;
}
function part2(input: Input): any {
  return part1(input, true);
}

if (require.main === module) {
  console.clear();
  const part1Example = `
.#.
..#
###
  `;
  const part2Example = ``;
  test({
    label: "exampleInput",
    parse,
    input: part1Example,
    expect: 112,
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
    expect: 848,
    func: part2,
  });

  test({
    label: "Part 2",
    parse,
    func: part2,
  });

  runTests(__dirname);
}
