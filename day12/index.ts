import { run } from "../common";

type Step = {
  direction: string;
  value: number;
};

const directionMap = {
  N: 90,
  S: 270,
  E: 0,
  W: 180,
};
function parse(str: string): Step[] {
  return str
    .trim()
    .split("\n")
    .map((line) => {
      const [, direction, value] = line.match(/(\w)(\d+)/)!;

      return {
        direction,
        value: Number(value),
      };
    });
}

function evasiveActions(directions: Step[]) {
  let facing = 0;
  let x = 0;
  let y = 0;

  function move(direction: number, value: number) {
    switch (direction) {
      case 0:
        x += value;
        break;
      case 90:
        y -= value;
        break;
      case 180:
        x -= value;
        break;
      case 270:
        y += value;
        break;
      default:
        throw new Error(`Invalid value ${value}`);
    }
  }

  directions.forEach(({ direction, value }) => {
    switch (direction) {
      case "R":
        value = -value;
      // eslint-disable-next-line no-fallthrough
      case "L":
        facing = (facing + value + 360) % 360;
        break;

      case "F":
        move(facing, value);
        break;
      case "N":
      case "S":
      case "E":
      case "W":
        move(directionMap[direction], value);
        break;
    }
    // console.log(`${direction}${value} | ${x}x${y} @${facing}`);
  });

  // console.log("end", x, y);
  return { x, y, facing };
}

function waypoints(directions: Step[]) {
  const ship = {
    x: 0,
    y: 0,
  };
  const waypoint = {
    x: 10,
    y: -1,
  };
  function moveWaypoint(direction: number, value: number) {
    switch (direction) {
      case 0:
        waypoint.x += value;
        break;
      case 90:
        waypoint.y -= value;
        break;
      case 180:
        waypoint.x -= value;
        break;
      case 270:
        waypoint.y += value;
        break;
      default:
        throw new Error(`Invalid value ${value}`);
    }
  }

  directions.forEach(({ direction, value }) => {
    switch (direction) {
      case "S":
      case "E":
      case "W":
      case "N":
        moveWaypoint(directionMap[direction], value);
        break;
      case "F":
        for (let i = 0; i < value; i++) {
          ship.x += waypoint.x;
          ship.y += waypoint.y;
        }
        break;
      case "R":
      case "L": {
        for (let i = 0; i < value; i += 90) {
          const x = waypoint.y;
          const y = waypoint.x;

          if (direction === "L") {
            waypoint.x = x;
            waypoint.y = -y;
          } else {
            waypoint.x = -x;
            waypoint.y = y;
          }
        }

        break;
      }
    }
    // console.log(`${direction}${value}`, ship, waypoint);
  });

  // console.log("end", ship);
  return ship;
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `
F10
N3
F7
R90
F11
    `,
    exampleOutput: 25,
    part1(input) {
      console.log(input);
      const { x, y } = evasiveActions(input);
      return Math.abs(x) + Math.abs(y);
    },
    part2Input: ``,
    part2Output: 286,
    part2(input) {
      // console.clear();
      const { x, y } = waypoints(input);
      return Math.abs(x) + Math.abs(y);
    },
    dir: __dirname,
  });
}
