import { run } from "../common";

enum State {
  Empty = "L",
  Occupied = "#",
  Floor = ".",
}

const stateValues = Object.values(State);
function isState(str: any): str is State {
  return stateValues.includes(str);
}

// This doesn't work with Enums
// function isEnum<T>(t: T) {
//   const values = Object.values(t);
//   return (i: any): i is T => values.includes(i);
// }
// const isState = isEnum(State);

type SeatLayout = Array<Array<State>>;
function parse(str: string): SeatLayout {
  return str
    .trim()
    .split("\n")
    .map((line) => {
      return line.split("").filter(isState);
    });
}

function printSeats(seats: SeatLayout): string {
  return seats.map((row) => row.join("")).join("\n");
}

function countAdjacent(seats: SeatLayout, x: number, y: number): number {
  let occupiedAdjacent = 0;
  for (let y2 = -1; y2 <= 1; y2++) {
    for (let x2 = -1; x2 <= 1; x2++) {
      if (y2 === 0 && x2 === 0) {
        continue;
      }
      if (y + y2 < 0 || y + y2 >= seats.length) {
        continue;
      }
      const r = seats[y + y2];
      if (x + x2 < 0 || x + x2 >= r.length) {
        continue;
      }

      if (r[x + x2] === State.Occupied) {
        occupiedAdjacent++;
      }
    }
  }
  return occupiedAdjacent;
}

function read(seats: SeatLayout, y: number, x: number): State {
  if (y >= 0 && y < seats.length) {
    const row = seats[y];
    if (x >= 0 && x < row.length) {
      return row[x];
    }
  }
  return State.Floor;
}

export function countLineOfSight(
  seats: SeatLayout,
  x: number,
  y: number
): number {
  const firstSeat: Record<string, null | string> = {
    n: null,
    s: null,
    e: null,
    w: null,
    nw: null,
    ne: null,
    sw: null,
    se: null,
  };
  const max = Math.max(seats.length, seats[0].length);

  for (let i = 1; i < max; i++) {
    if (!firstSeat.w && read(seats, y, x - i) !== State.Floor) {
      firstSeat.w = read(seats, y, x - i);
    }
    if (!firstSeat.e && read(seats, y, x + i) !== State.Floor) {
      firstSeat.e = read(seats, y, x + i);
    }
    if (!firstSeat.n && read(seats, y - i, x) !== State.Floor) {
      firstSeat.n = read(seats, y - i, x);
    }
    if (!firstSeat.s && read(seats, y + i, x) !== State.Floor) {
      firstSeat.s = read(seats, y + i, x);
    }
    if (!firstSeat.nw && read(seats, y - i, x - i) !== State.Floor) {
      firstSeat.nw = read(seats, y - i, x - i);
    }
    if (!firstSeat.sw && read(seats, y + i, x - i) !== State.Floor) {
      firstSeat.sw = read(seats, y + i, x - i);
    }
    if (!firstSeat.ne && read(seats, y - i, x + i) !== State.Floor) {
      firstSeat.ne = read(seats, y - i, x + i);
    }
    if (!firstSeat.se && read(seats, y + i, x + i) !== State.Floor) {
      firstSeat.se = read(seats, y + i, x + i);
    }
  }
  // console.log(x, y, seats[y][x]);

  return Object.values(firstSeat).filter((seat) => seat === State.Occupied)
    .length;
}

const countOccupied = (seats: SeatLayout) =>
  seats.reduce(
    (total, row) =>
      total + row.filter((seat) => seat === State.Occupied).length,
    0
  );

function applyRules(
  seats: SeatLayout,
  count: typeof countAdjacent,
  threshold = 4
): SeatLayout {
  const nextGeneration: SeatLayout = [];

  for (let y = 0; y < seats.length; y++) {
    const row = seats[y];
    nextGeneration.push([]);

    for (let x = 0; x < row.length; x++) {
      const seat = row[x];

      const occupiedAdjacent = count(seats, x, y);

      // Copy the current seat by default
      nextGeneration[y][x] = seat;
      switch (seat) {
        case State.Empty:
          if (occupiedAdjacent === 0) {
            nextGeneration[y][x] = State.Occupied;
          }

          break;
        case State.Occupied:
          if (occupiedAdjacent >= threshold) {
            nextGeneration[y][x] = State.Empty;
          }
      }
    }
  }

  return nextGeneration;
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `
L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL

    `,
    exampleOutput: 37,
    async part1(input) {
      // console.log(input);
      let current: SeatLayout = input;
      let next: SeatLayout = current;
      do {
        current = next;
        next = applyRules(current, countAdjacent);
        // console.clear();
        // console.log(printSeats(current));
        // console.log(numChanges);
        // await new Promise((resolve) => setTimeout(resolve, 1000));
      } while (printSeats(current) != printSeats(next));

      return countOccupied(current);
    },
    part2Output: 26,
    async part2(seats) {
      let current: SeatLayout = seats;
      let next: SeatLayout = current;

      do {
        current = next;
        next = applyRules(current, countLineOfSight, 5);
        // console.clear();
        // console.log(printSeats(current), "\n\n");
        // await new Promise((resolve) => setTimeout(resolve, 100));
      } while (printSeats(current) != printSeats(next));

      // console.log(printSeats(current), "\n\n");
      return countOccupied(current);
    },
    dir: __dirname,
  });
}
