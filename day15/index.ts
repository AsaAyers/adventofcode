/* eslint-disable prefer-const */
import { run } from "../common";

function parse(str: string) {
  return str.trim().split(",").map(Number);
}

function memoryGame(startingNumbers: number[], iterations: number) {
  const history: Record<number, number[]> = [];
  let last = 0;
  let next = 0;
  for (let turn = 0; turn < iterations; turn++) {
    if (turn < startingNumbers.length) {
      next = startingNumbers[turn];
    } else {
      if (history[last].length === 1) {
        // const zero = history[0];
        // const lastZero = zero[zero.length - 1];
        // console.log((turn / iterations).toFixed(2), turn - lastZero, last);
        next = 0;
      } else {
        const [a, b] = history[last];

        next = b - a;
      }
    }

    if (history[next] === undefined) {
      history[next] = [];
    }
    history[next].push(turn);
    if (history[next].length > 2) {
      history[next].shift();
    }
    // console.log((turn / iterations).toFixed(2), turn , next/last);
    // if (turn % 1000 === 0) {
    //   console.log(turn, next, history[next]);
    // }
    // console.log(turn, next);
    last = next;
  }

  return last;
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `0,3,6`,
    exampleOutput: 436,
    part1(input) {
      return memoryGame(input, 2020);
    },
    part2Input: ``,
    part2Output: 175594,
    part2(input) {
      return 0;
      // const iterations = 30000000;

      // let actual, expected;

      // actual = memoryGame(parse(`0,3,6`), iterations);
      // expected = 175594;
      // if (actual !== expected) {
      //   console.log("Actual:", actual);
      //   console.log("Expected:", expected);
      // }

      // return memoryGame(input, iterations);
    },
    dir: __dirname,
  });
}
