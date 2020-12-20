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
      return tile.pixels[tile.pixels.length - 1];
    case "E":
      return tile.pixels.map((row) => row[0]);
    case "W":
      return tile.pixels.map((row) => row[row.length - 1]);
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
      const tiles = row.map(printTile).map((str) => str.split("\n"));

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
  return readEdge(a, direction) === readEdge(b, oppositeSide[direction]);
}

function isValid(grid: Tile[][], x: number, y: number): boolean {
  const neighbors: Array<[Side, number, number]> = [
    ["N", 0, -1],
    ["S", 0, 1],
    ["E", 1, 0],
    ["W", -1, 0],
  ];

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

function part1(grid: Input): any {
  console.log(printGrid(grid));

  console.log(isValid(grid, 0, 0));
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];

    for (let x = 0; x < row.length; x++) {}
  }

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
