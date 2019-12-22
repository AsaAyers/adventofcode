import { debuglog } from 'util'

const debug = debuglog('intcode')
const debugParams = debuglog('intcode:params')

type Memory = Array<number>
export const parse = (str: string): Memory => str.split(',').map(Number)

export function* intcode(
  m: Memory,
): Generator<number | undefined> {
  let output
  debug('intcode(%o, %o)', m)
  const memory = [...m]

  let instructionPointer = 0

  let opCode

  do {
    opCode = memory[instructionPointer] % 100

    let tmp = Math.floor(memory[instructionPointer] / 100)

    let paramModes: number[] = []
    while (tmp > 0) {
      paramModes.push(tmp % 10)
      tmp = Math.floor(tmp / 10)
    }

    let pointerMove = 1


    const paramAddress = (i: number) => {
      pointerMove = Math.max(pointerMove, i + 1)

      debugParams('paramValue', { modes: paramModes, ptr: instructionPointer + i, memory })
      switch (paramModes[i - 1]) {
        case 1:
          return memory[instructionPointer + i]
        default: {
          const address = memory[instructionPointer + i]
          return memory[address]
        }
      }
    }

    const paramValue = (i: number) => {
      pointerMove = Math.max(pointerMove, i + 1)

      debugParams('paramValue', { modes: paramModes, ptr: instructionPointer + i, memory })
      switch (paramModes[i - 1]) {
        case 1:
          return memory[instructionPointer + i]
        default: {
          const address = memory[instructionPointer + i]
          return memory[address]
        }
      }
    }

    debug('opCode', memory[instructionPointer], output, memory)
    switch (opCode) {
      case 1: { // add
        const left = paramValue(1)
        const right = paramValue(2)
        const destAddress = memory[instructionPointer + 3]
        pointerMove = 4

        debug('add', left, right)
        memory[destAddress] = left + right
        break;
      }
      case 2: { // multiply
        const left = paramValue(1)
        const right = paramValue(2)
        const destAddress = memory[instructionPointer + 3]
        pointerMove = 4
        debug('multiply', left, right)
        memory[destAddress] = left * right
        break;
      }
      case 3: { // Set
        const destAddress = memory[instructionPointer + 1]
        const value = yield
        if (value == null) {
          throw new Error('Set called with an empty value')
        }
        if (typeof value !== 'number') {
          throw new Error(`Invalid value ${value}`)
        }

        debug('set memory[%d] = %d', destAddress, value)
        memory[destAddress] = value
        pointerMove = 2
        break;
      }
      case 4: { // Get
        const output = paramValue(1)
        debug('output = %d', output)
        yield output
        pointerMove = 2
        break;
      }
      case 5: { // jump-if-true
        const value = paramValue(1)
        const address = paramValue(2)
        debug('if %d != 0 jump %d', value, address)
        if (value != 0) {
          instructionPointer = address
          pointerMove = 0
        } else {
          pointerMove = 3
        }
        break;
      }
      case 6: { // jump-if-false
        const value = paramValue(1)
        const address = paramValue(2)

        debug('if %d === 0 jump %d', value, address)
        if (value === 0) {
          instructionPointer = address
          pointerMove = 0
        } else {
          pointerMove = 3
        }
        break;
      }
      case 7: { // less than
        const left = paramValue(1)
        const right = paramValue(2)
        const address = memory[instructionPointer + 3]

        debug('set memory[%d] = (%d < %d)', address, left, right)
        memory[address] = (left < right ? 1 : 0)

        pointerMove = 4
        break;
      }
      case 8: { // equals
        const left = paramValue(1)
        const right = paramValue(2)
        const address = memory[instructionPointer + 3]

        debug('set memory[%d] = (%d === %d)', address, left, right)
        memory[address] = (left === right ? 1 : 0)

        pointerMove = 4
        break;
      }
      case 99:
        pointerMove = 0
        break;
      default:
        throw new Error(`Invalid op code at address ${instructionPointer}: ${memory[instructionPointer]} `)
    }

    instructionPointer += pointerMove
  } while (opCode !== 99)

  // return memory
}

export function amp(program: string, sequence: string) {
  return sequence
    .split(',')
    .map(Number)
    .reduce((input: number, phase: number): number => {
      const memory = parse(program)
      const iterator = intcode(memory)
      iterator.next()

      iterator.next(phase)
      const out = iterator.next(input)

      return out.value
    }, 0)
}

export function feedback(program: string, sequence: string) {
  const phases = sequence
    .split(',')
    .map(Number)

  const amps = phases.map(() => {
    const memory = parse(program)
    const iterator = intcode(memory)
    iterator.next()
    return iterator
  })

  let input: IteratorResult<number | undefined, any> = {
    done: false,
    value: 0
  }

  let count = 0
  do {
    const next: IteratorResult<number | undefined, any> = amps.reduce((input: IteratorResult<number | undefined, any>, iterator, index) => {
      iterator.next(phases[index])
      const output = iterator.next(input.value)

      return output
    }, input)

    if (next.value) {
      input = next
    }
    if (next.done) {
      return input.value
    }

  } while (!input.done && count++ < 1000)
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
    }
  }
  return {
    sequence: bestSequence,
    output: maxOutput,
  }
}

function optimizeFeedback(program: string, phases: number[]) {
  const permutations = permutationGenerator(phases)

  let bestSequence
  let maxOutput = 0
  for (const sequence of permutations) {
    const current = feedback(program, sequence.join(','))

    if (current > maxOutput) {
      bestSequence = sequence.join(',')
      maxOutput = current
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
  console.log('part1', optimizeFeedback(input, [5, 6, 7, 8, 9]))



}
