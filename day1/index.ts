import fs from 'fs'

const exampleInput = `
1721
979
366
299
675
1456
`.trim()

function parse(str: string): number[] {
  return str.split('\n').map(Number).filter(Boolean)
}

function findPair(target: number, report: number[]) {
  const results: [number, number][] = []
  for (let index = 0; index < report.length; index++) {
    const a = report[index];
    if (a >= target) { continue }
    const b = target - a

    if (report.includes(b)) {
      results.push([a, b])
    }
  }
  return results
}

function part1(input: string) {
  const report = parse(input)

  return findPair(2020, report).map(([a, b]) => [a, b, a * b])
}

function part2(input: string) {
  const report = parse(input)

  const results: [number, number, number][] = []
  for (let i = 0; i < report.length; i++) {
    const a = report[i];
    const remainder = 2020 - a

    const pairs = findPair(remainder, report)
    for (let j = 0; j < pairs.length; j++) {
      const [b, c] = pairs[j];
      results.push([a, b, c])
    }
  }

  return results.map(
    ([a,b,c]) => a * b * c
  )
}




console.log(part1(exampleInput))

const input = String(fs.readFileSync('day1/input.txt'))
console.log(part1(input))
console.log(part2(input))