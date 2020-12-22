import { runTests, test } from "../common";

type Pixel = "." | "#";
type Tile = {
  id: number;
  pixels: Pixel[][];
};

function parse(str: string) {
  const lines = str.trim().split("\n");

  const tiles: Tile[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/Tile (\d+):/);
    if (match) {
      const tile: Tile = {
        id: Number(match[1]),
        pixels: [],
      };
      tiles.push(tile);

      for (i++; i < lines.length; i++) {
        const l = lines[i];

        if (l === "") {
          break;
        }
        tile.pixels.push(l.split("") as Pixel[]);
      }
    }
  }

  const width = Math.sqrt(tiles.length);
  const grid: Tile[][] = [];
  for (let i = 0; i < tiles.length; i++) {
    if (i % width === 0) {
      grid.push([]);
    }
    const row = grid[grid.length - 1];
    row.push(tiles[i]);
  }
  return grid;
}
type Input = ReturnType<typeof parse>;

type Side = "N" | "S" | "E" | "W";
function readEdge(tile: Tile, side: Side) {
  switch (side) {
    case "N":
      return tile.pixels[0].join("");
    case "S":
      return tile.pixels[tile.pixels.length - 1].join("");
    case "E":
      return tile.pixels.map((row) => row[0]).join("");
    case "W":
      return tile.pixels.map((row) => row[row.length - 1]).join("");
  }
}

function rotate(tile: Tile) {
  const pixels: Pixel[][] = [];

  for (let i = tile.pixels.length - 1; i > 0; i--) {
    const row = tile.pixels[i];

    for (let j = 0; j < row.length; j++) {
      const pixel = row[j];

      pixels[j] = pixels[j] || [];
      pixels[j].push(pixel);
    }
  }

  return {
    id: tile.id,
    pixels,
  };
}

function flip(tile: Tile): Tile {
  return {
    id: tile.id,
    pixels: tile.pixels.reverse(),
  };
}

const printTile = (tile: Tile): string =>
  `Tile ${tile.id}:\n` + tile.pixels.map((row) => row.join("")).join("\n");

const printGrid = (grid: Tile[][]): string =>
  grid
    .map((row) => {
      const tiles = row.map(printTile).map((str) => {
        const tileRow = str.split("\n");
        return tileRow;
      });

      return tiles[0]
        .map((_line, rowIndex) => tiles.map((f) => f[rowIndex]).join(" "))
        .join("\n");
    })
    .join("\n\n");

function multiplyCorners(grid: Tile[][]) {
  const firstRow = grid[0];
  const lastRow = grid[grid.length - 1];

  const nw = firstRow[0];
  const ne = firstRow[firstRow.length - 1];
  const sw = lastRow[0];
  const se = lastRow[lastRow.length - 1];

  return nw.id * ne.id * sw.id * se.id;
}

const oppositeSide: Record<Side, Side> = {
  N: "S",
  S: "N",
  E: "W",
  W: "E",
};

function edgesMatch(a: Tile, direction: Side, b: Tile) {
  const edgeA = readEdge(a, direction);
  const edgeB = readEdge(b, oppositeSide[direction]);
  // console.log(
  //   "edgesMatch?",
  //   a.id,
  //   direction,
  //   b.id,
  //   edgeA,
  //   edgeA === edgeB,
  //   edgeB
  // );
  return edgeA === edgeB;
}

const neighbors: Array<[Side, number, number]> = [
  ["N", 0, -1],
  ["S", 0, 1],
  ["E", 1, 0],
  ["W", -1, 0],
];
export function isValid(grid: Tile[][], x: number, y: number): boolean {
  const self = grid[y][x];

  return neighbors.every(([direction, xOffset, yOffset]) => {
    const row = grid[y + yOffset];
    if (row == null) {
      return true;
    }
    const tile = row[x + xOffset];
    if (tile == null) {
      return true;
    }

    return edgesMatch(self, direction, tile);
  });
}

function traverseGrid<T>(
  grid: Tile[][],
  callback: (t: Tile, x: number, y: number) => T
) {
  return grid.flatMap((row, y) =>
    row.map((_tile, x) => callback(grid[y][x], x, y))
  );
}

const findNeighbors = (grid: Tile[][], currentTile: Tile, side: Side) => {
  const [direction, x, y] = neighbors.find(
    ([direction]) => direction === side
  )!;

  return traverseGrid(grid, (tile) => {
    if (currentTile.id == tile.id) {
      return [];
    }

    let t = tile;
    if (edgesMatch(currentTile, direction, t)) {
      return { x, y, t };
    }
    t = flip(t);
    if (edgesMatch(currentTile, direction, t)) {
      return { x, y, t };
    }
    t = rotate(t);
    if (edgesMatch(currentTile, direction, t)) {
      return { x, y, t };
    }
    return [];
  }).flat(2);
};

const isValidGrid = (grid: Tile[][]) =>
  grid.every((row, y) => row.every((tile, x) => isValid(grid, x, y)));

const notEmpty = <T>(t: T): t is T => t != null;

const findAddress = (grid: Tile[][], id: Tile["id"]) =>
  traverseGrid(grid, (tile, x, y) => {
    if (tile.id === id) {
      return { x, y };
    }
  }).filter(notEmpty)[0]!;

export const matchNeighbors = (
  grid: Tile[][],
  current: { x: number; y: number }
) => {
  const currentTile = grid[current.y][current.x];
  console.log("current", current, currentTile.id);
  const neighbors = findNeighbors(grid, currentTile, "E");

  for (let i = 0; i < neighbors.length; i++) {
    const { x, y, t } = neighbors[i];
    if (current.y + y < 0) {
      console.log("pop/unshift rows");
      grid.unshift(grid.pop()!);
      current.y++;
    }
    if (current.x + x < 0) {
      console.log("pop/unshift columns");
      grid.forEach((row) => {
        row.unshift(row.pop()!);
      });
      current.x++;
    }
    if (current.y + y >= grid.length) {
      console.log("shift/push rows");
      grid.push(grid.shift()!);
      current.y--;
    }
    const row = grid[current.y + y];
    if (current.x + x >= row.length) {
      console.log("shift/push rows");
      grid.forEach((row) => {
        row.push(row.shift()!);
      });
      current.x--;
    }

    const tmp = findAddress(grid, t.id);

    if (!tmp) {
      throw new Error(`Failed to find address for ${t.id}\n${printGrid(grid)}`);
    }

    const currentNeighbor = grid[current.y + y][current.x + x];
    grid[tmp.y][tmp.x] = currentNeighbor;
    grid[current.y + y][current.x + x] = t;

    console.log(
      "moved",
      t.id,
      {
        x: current.x + x,
        y: current.y + y,
      },
      "=>",
      currentNeighbor.id,
      tmp
    );
  }
};

function part1(grid: Input): any {
  console.log(printGrid(grid));

  let count = 0;
  while (!isValidGrid(grid) && count++ < 500) {
    for (let y = 0; y < grid.length; y++) {
      const row = grid[y];
      for (let x = 0; x < row.length; x++) {
        if (!isValid(grid, x, y)) {
          matchNeighbors(grid, { x, y });
        }
      }
    }
    // matchNeighbors(grid, { x: 0, y: 0 });
    // break;
  }

  console.log("count:", count);
  console.log(printGrid(grid));
  return multiplyCorners(grid);
}
function part2(input: Input): any {
  return input;
}

if (require.main === module) {
  console.clear();
  const part1Example = `
Tile 2311:
..##.#..#.
##..#.....
#...##..#.
####.#...#
##.##.###.
##...#.###
.#.#.#..##
..#....#..
###...#.#.
..###..###

Tile 1951:
#.##...##.
#.####...#
.....#..##
#...######
.##.#....#
.###.#####
###.##.##.
.###....#.
..#.#..#.#
#...##.#..

Tile 1171:
####...##.
#..##.#..#
##.#..#.#.
.###.####.
..###.####
.##....##.
.#...####.
#.##.####.
####..#...
.....##...

Tile 1427:
###.##.#..
.#..#.##..
.#.##.#..#
#.#.#.##.#
....#...##
...##..##.
...#.#####
.#.####.#.
..#..###.#
..##.#..#.

Tile 1489:
##.#.#....
..##...#..
.##..##...
..#...#...
#####...#.
#..#.#.#.#
...#.#.#..
##.#...##.
..##.##.##
###.##.#..

Tile 2473:
#....####.
#..#.##...
#.##..#...
######.#.#
.#...#.#.#
.#########
.###.#..#.
########.#
##...##.#.
..###.#.#.

Tile 2971:
..#.#....#
#...###...
#.#.###...
##.##..#..
.#####..##
.#..####.#
#..#.#..#.
..####.###
..#.#.###.
...#.#.#.#

Tile 2729:
...#.#.#.#
####.#....
..#.#.....
....#..#.#
.##..##.#.
.#.####...
####.#.#..
##.####...
##..#.##..
#.##...##.

Tile 3079:
#.#.#####.
.#..######
..#.......
######....
####.#..#.
.#...#.##.
#.#####.##
..#.###...
..#.......
..#.###...


  `;
  const part2Example = ``;
  test({
    label: "exampleInput",
    parse,
    input: part1Example,
    expect: 20899048083289,
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
