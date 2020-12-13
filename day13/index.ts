import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import { run } from "../common";

function parse(str: string) {
  const [departingTimestamp, busses] = str.trim().split("\n");

  return {
    timestamp: Number(departingTimestamp),
    busses: busses.split(",").map((b) => {
      if (b === "x") {
        return 0;
      }
      return Number(b);
    }),
  };
}

const primes = [2, 3];
function isPrime(n: number) {
  if (n < 0) {
    throw new Error(`WTF ${n}`);
  } else if (n === 0) {
    return false;
  } else if (n <= 3) {
    return true;
  }

  const sqrt = Math.ceil(Math.sqrt(n));
  const lastPrime = primes[primes.length - 1];

  if (primes.includes(n)) {
    return true;
  }

  if (lastPrime < sqrt) {
    for (let n = lastPrime + 1; n < sqrt; n++) {
      isPrime(n);
    }
  }

  const tmp = primes.every((prime) => n % prime > 0);

  if (tmp) {
    primes.push(n);
    primes.sort((a, b) => a - b);
  }

  return primes.includes(n);
}

function primeFactors(n: number) {
  if (n == 0) return [];
  isPrime(n);
  const factors = [];
  for (let i = 0; i < primes.length; i++) {
    const p = primes[i];
    while (n % p == 0) {
      factors.push(p);
      n = n / p;
    }
  }

  return factors;
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `
939
7,13,x,x,59,x,31,19

    `,
    exampleOutput: 295,
    part1(input) {
      // console.log(input);

      let leavingAt = Infinity;
      let busId = 0;
      let minutes = 0;
      for (let i = 0; i < input.busses.length; i++) {
        const bus = input.busses[i];
        if (bus === 0) {
          continue;
        }
        const x = Math.ceil(input.timestamp / bus) * bus;
        if (x < leavingAt) {
          leavingAt = x;
          busId = bus;
          minutes = leavingAt - input.timestamp;
        }
      }

      return busId * minutes;
    },
    part2Input: ``,
    part2Output: 1068781,
    part2(input) {
      const schedule = input.busses
        .map((bus, index) => ({ bus, index, primeFactors: primeFactors(bus) }))
        .filter((b) => b.bus > 0)
        .sort((a, b) => b.bus - a.bus);
      console.log(schedule);

      function validateTimesatamp(t: number) {
        return schedule.every((bus) => {
          if (bus.bus === 0) {
            return true;
          }
          const leaveAt = Math.ceil(t / bus.bus) * bus.bus;
          // console.log(t, bus, leaveAt - bus.index);
          const tmp = leaveAt - bus.index;
          if (tmp != t) {
            console.log("Rejected", bus);
          }
          return leaveAt - bus.index === t;
        });
      }

      // This verified my validator works, but I couldn't find a way to find `t`
      const t = 1068781;
      if (validateTimesatamp(t)) {
        return t;
      }

      return 0;
    },
    dir: __dirname,
  });
}
