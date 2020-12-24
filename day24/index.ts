import { timeLog } from "console";
import { isTemplateLiteralToken } from "typescript";
import { runTests, test } from "../common";

type Address = {
  x: number;
  y: number;
};

type Tile = Address & {
  color: "white" | "black";
};

type Floor = Record<string, Tile>;

function parse(str: string) {
  const directions = /^(e|se|sw|w|nw|ne)/;
  return str
    .trim()
    .split("\n")
    .map((line) => {
      const tmp: string[] = [];
      while (line.length > 0) {
        line = line.replace(directions, (substring: string) => {
          tmp.push(substring);
          return "";
        });
      }

      return tmp;
    });
}
type Input = ReturnType<typeof parse>;

const move = (addr: Address, direction: string): Address => {
  const address = { ...addr };
  // console.log("move", direction, address);
  switch (direction) {
    case "w":
      address.x -= 2;
      return address;
    case "e":
      address.x += 2;
      return address;
    case "se":
      address.y -= 1;
      address.x += 1;
      return address;
    case "sw":
      address.y -= 1;
      address.x -= 1;
      return address;
    case "nw":
      address.y += 1;
      address.x -= 1;
      return address;
    case "ne":
      address.y += 1;
      address.x += 1;
      return address;
    default:
  }
  throw new Error(`invalid move: ${move}`);
};
const getAdjacent = (addr: Address): Address[] => [
  move(addr, "w"),
  move(addr, "e"),
  move(addr, "se"),
  move(addr, "sw"),
  move(addr, "ne"),
  move(addr, "nw"),
];

const setupFloor = (tiles: Address[]) => {
  return tiles.reduce((floor: Floor, addr: Address) => {
    const tileKey = `${addr.x},${addr.y}`;

    if (floor[tileKey] === undefined) {
      floor[tileKey] = {
        ...addr,
        color: "white",
      };
    }
    const tile = floor[tileKey];
    tile.color = tile.color === "white" ? "black" : "white";

    return floor;
  }, {});
};

function part1(input: Input): any {
  const tiles = input.map((directions) => {
    return directions.reduce(move, { x: 0, y: 0 });
  });
  const floor = setupFloor(tiles);

  return Object.values(floor).reduce((total, tile) => {
    if (tile.color === "black") {
      return total + 1;
    }
    return total;
  }, 0);
}

function life(floor: Floor): Floor {
  const nextGeneration: Floor = {};

  const processTile = (addr: Address) => {
    const adjacent = getAdjacent(addr);
    const count = adjacent.reduce((total, addr) => {
      const tileKey = `${addr.x},${addr.y}`;
      if (floor[tileKey] && floor[tileKey].color === "black") {
        return total + 1;
      }

      return total;
    }, 0);
    const tileKey = `${addr.x},${addr.y}`;
    const tile = floor[tileKey];
    if (tile && tile.color === "black") {
      if (count === 1 || count === 2) {
        nextGeneration[tileKey] = {
          ...addr,
          color: "black",
        };
      }
    } else {
      if (count === 2) {
        nextGeneration[tileKey] = {
          ...addr,
          color: "black",
        };
      }
    }
  };

  Object.values(floor).forEach((tile) => {
    processTile(tile);
    const adjacent = getAdjacent(tile);
    adjacent.forEach(processTile);
  });

  return nextGeneration;
}

function part2(input: Input): any {
  const tiles = input.map((directions) => {
    return directions.reduce(move, { x: 0, y: 0 });
  });
  let floor = setupFloor(tiles);

  for (let generation = 0; generation < 100; generation++) {
    // console.log("generation", generation);
    floor = life(floor);
  }

  return Object.values(floor).reduce((total, tile) => {
    if (tile.color === "black") {
      return total + 1;
    }
    return total;
  }, 0);
}

if (require.main === module) {
  console.clear();
  const part1Example = `
  
sesenwnenenewseeswwswswwnenewsewsw
neeenesenwnwwswnenewnwwsewnenwseswesw
seswneswswsenwwnwse
nwnwneseeswswnenewneswwnewseswneseene
swweswneswnenwsewnwneneseenw
eesenwseswswnenwswnwnwsewwnwsene
sewnenenenesenwsewnenwwwse
wenwwweseeeweswwwnwwe
wsweesenenewnwwnwsenewsenwwsesesenwne
neeswseenwwswnwswswnw
nenwswwsewswnenenewsenwsenwnesesenew
enewnwewneswsewnwswenweswnenwsenwsw
sweneswneswneneenwnewenewwneswswnese
swwesenesewenwneswnwwneseswwne
enesenwswwswneneswsenwnewswseenwsese
wnwnesenesenenwwnenwsewesewsesesew
nenewswnwewswnenesenwnesewesw
eneswnwswnwsenenwnwnwwseeswneewsenese
neswnwewnwnwseenwseesewsenwsweewe
wseweeenwnesenwwwswnew

  `;
  const part2Example = ``;
  test({
    label: "exampleInput",
    parse,
    input: part1Example,
    expect: 10,

    // flips reference tile
    // input: "nwwswee",

    // input: "esew",
    // expect: 1,
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
    expect: 2208,
    func: part2,
  });

  test({
    label: "Part 2",
    parse,
    func: part2,
  });

  runTests(__dirname);
}
