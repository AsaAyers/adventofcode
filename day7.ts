import { parse, intcode } from './day5'

export function amp(program: string, sequence: string) {
  return sequence
    .split(',')
    .map(Number)
    .reduce((input: number, phase: number) => {
      const memory = parse(program)
      const out = intcode(memory, [phase, input])
      if (Array.isArray(out)) {
        throw new Error('No output provided')
      }
      return out
    }, 0)
}

export function* permutationGenerator<T>(
  items: T[],
  prefix: T[] = []
): Generator<T[]> {
  if (items.length === 0) {
    yield prefix.concat(items)
  }

  for (let i = 0; i < items.length; i++) {
    const rest = [...items]
    let [current] = rest.splice(i, 1)

    yield* permutationGenerator(rest, prefix.concat([current]))
  }
}

export function optimizeAmps(program: string, phases: number[]) {
  const permutations = permutationGenerator(phases)

  let bestSequence
  let maxOutput = 0
  for (const sequence of permutations) {
    const current = amp(program, sequence.join(','))

    if (current > maxOutput) {
      bestSequence = sequence.join(',')
      maxOutput = current
      console.log(bestSequence, maxOutput)
    }
  }
  return {
    sequence: bestSequence,
    output: maxOutput,
  }
}



if (require.main === module) {
  const input = `
  3,8,1001,8,10,8,105,1,0,0,21,34,43,64,85,98,179,260,341,422,99999,3,9,1001,9,3,9,102,3,9,9,4,9,99,3,9,102,5,9,9,4,9,99,3,9,1001,9,2,9,1002,9,4,9,1001,9,3,9,1002,9,4,9,4,9,99,3,9,1001,9,3,9,102,3,9,9,101,4,9,9,102,3,9,9,4,9,99,3,9,101,2,9,9,1002,9,3,9,4,9,99,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,2,9,4,9,99,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,99,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,99
  `
  //
  console.log('part1', optimizeAmps(input, [0, 1, 2, 3, 4]))


}
