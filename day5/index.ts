import { run } from "../common";

type Seat = { row: number; col: number };

const seatId = ({ row, col }: Seat) => row * 8 + col;

// I used this for my initial solutions before realizing I could just convert
// the strings to binary
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function binarySpaceParitioning(max: number, string: string) {
  let distance = Math.round(max / 2);

  return string.split("").reduce((middle, char) => {
    // console.log(char, middle);
    // console.log("cut distance", distance);
    distance = distance / 2;
    if (distance < 1) {
      middle -= distance;
      // console.log("skip cut?", middle, distance);
    }
    switch (char) {
      case "F": //lower
      case "L": //lower
        // console.log("down", middle - distance);
        return middle - distance;
      default:
        // console.log("up", middle + distance);
        return middle + distance;
    }
    return middle;
  }, distance);
}

function toBinary(str: string) {
  const binaryString = str.replace(/[FL]/g, "0").replace(/[BR]/g, "1");

  return parseInt(binaryString, 2);
}

function parse(str: string) {
  return str
    .trim()
    .split("\n")
    .map((line) => {
      const row = line.substr(0, 7);
      const col = line.substr(7, 10);

      // console.log(toBinary(row));

      return {
        // row: binarySpaceParitioning(127, row),
        // col: binarySpaceParitioning(7, col),
        row: toBinary(row),
        col: toBinary(col),
      };
    });
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `FBFBBFFRLR`,
    exampleOutput: 357,
    part1(input) {
      // console.log(input);
      return input.reduce((maxId, seat) => {
        const id = seatId(seat);
        // console.log(seat, maxId, id);
        return Math.max(maxId, id);
      }, 0);
    },
    part2Input: ``,
    part2Output: 1,
    part2(input) {
      const ids = input.map(seatId);
      // console.log(ids);

      const isEmpty = (seat: Seat) => !ids.includes(seatId(seat));

      const scanAround = ({ row, col }: Seat) => {
        for (let r = -1; r < 1; r++) {
          for (let c = -1; c < 1; c++) {
            if (r === 0 && c === 0) {
              continue;
            }
            const seat = { row: row + r, col: col + c };
            if (isEmpty(seat)) {
              return false;
            }
          }
        }
        return true;
      };

      for (let row = 1; row < 127; row++) {
        for (let col = 1; col < 7; col++) {
          const seat = { row, col };
          if (isEmpty(seat)) {
            if (scanAround(seat)) {
              return seatId(seat);
            }
          }
        }
      }

      return 1;
    },
    dir: __dirname,
  });
}
