import { run } from "../common";

enum Entity {
  Tree = "#",
  Open = ".",
}
type Map = Array<Array<Entity>>;

function parseMap(str: string): Map {
  return str
    .trim()
    .split("\n")
    .map((line, lineIndex) => {
      return line.split("").map((char, charIndex) => {
        switch (char) {
          case Entity.Tree:
            return Entity.Tree;
          case Entity.Open:
            return Entity.Open;
          default:
            throw new Error(
              `Unrecognized character '${char}' at ${lineIndex} ${charIndex}`
            );
        }
      });
    });
}

function toboggan(map: Map, right: number, down: number): number {
  let numTrees = 0;

  let x = 0;
  let y = 0;

  do {
    const row = map[y];
    if (row[x % row.length] === Entity.Tree) {
      numTrees++;
    }

    y += down;
    x += right;
  } while (map[y] != undefined);

  return numTrees;
}

if (require.main === module) {
  run({
    parse: parseMap,
    // # are trees
    // . open squares
    exampleInput: `
..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#
 `,
    exampleOutput: 7,
    part1(input) {
      // console.log(input);

      return toboggan(input, 3, 1);
    },
    part2Example: 336,
    part2(input) {
      const slopes = [
        { right: 1, down: 1 },
        { right: 3, down: 1 },
        { right: 5, down: 1 },
        { right: 7, down: 1 },
        { right: 1, down: 2 },
      ];
      return slopes.reduce((total, slope) => {
        const trees = toboggan(input, slope.right, slope.down);
        console.log("trees", slope, trees, total);
        return total * trees;
      }, 1);
    },
    dir: __dirname,
  });
}
