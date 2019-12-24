import { debuglog } from 'util'
import Chance from 'chance'

const chance = new Chance(1)


const debug = debuglog('intcode')
const debugOp = debuglog('intcode:op')
const debugParams = debuglog('intcode:params')

type Memory = Array<number>
export const parse = (str: string): Memory => str.split(',').map(Number)

interface RAM {
  memory: Memory,
  instructionPointer: number,
  relativeBase: number,
}

enum OpCode {
  ADD = 1,
  MUL = 2,
  IN = 3,
  OUT = 4,
  JMPT = 5,
  JMPF = 6,
  LT = 7,
  EQ = 8,
  REL = 9,
  END = 99,
}

enum Param {
  Value = 'v',
  Address = 'a',
}

type OpCodeParams = {
  [key in OpCode]: {
    name: string,
    paramTypes: Param[]
  }
}
const opCodeInfo: OpCodeParams = {
  [OpCode.ADD]: {
    name: 'ADD',
    paramTypes: [Param.Value, Param.Value, Param.Address],
  },
  [OpCode.MUL]: {
    name: 'MUL',
    paramTypes: [Param.Value, Param.Value, Param.Address],
  },
  [OpCode.IN]: {
    name: 'IN',
    paramTypes: [Param.Address],
  },
  [OpCode.OUT]: {
    name: 'OUT',
    paramTypes: [Param.Value],
  },
  [OpCode.JMPT]: {
    name: 'JMPT',
    paramTypes: [Param.Value, Param.Value],
  },
  [OpCode.JMPF]: {
    name: 'JMPF',
    paramTypes: [Param.Value, Param.Value],
  },
  [OpCode.LT]: {
    name: 'LT',
    paramTypes: [Param.Value, Param.Value, Param.Address],
  },
  [OpCode.EQ]: {
    name: 'EQ',
    paramTypes: [Param.Value, Param.Value, Param.Address],
  },
  [OpCode.REL]: {
    name: 'REL',
    paramTypes: [Param.Address],
  },
  [OpCode.END]: {
    name: 'END',
    paramTypes: [],
  },
}

function isOpCode(code: number): code is OpCode {
  return Object.keys(opCodeInfo).includes(String(code))
}

export function debugOpCode(
  ram: RAM,
) {
  const read = (i: number) => ram.memory[i] || 0
  const opCode = ram.memory[ram.instructionPointer] % 100
  if (!isOpCode(opCode)) { throw new Error(`Invalid op code ${opCode}@${ram.instructionPointer}`) }

  const { name, paramTypes } = opCodeInfo[opCode]

  let pModes = Math.floor(read(ram.instructionPointer) / 100)
  let paramModes: number[] = []
  while (pModes > 0) {
    paramModes.push(pModes % 10)
    pModes = Math.floor(pModes / 10)
  }

  const parameters = paramTypes.map((type, i) => {
    let modeName = ''
    const mode = paramModes[i] || 0
    if (mode === 1) {
      modeName = ' imm'
    } else if (mode === 2) {
      modeName = ' rel'
    }

    return type + read(ram.instructionPointer + i + 1) + modeName
  })

  const resolved = paramTypes.map((type, i) => {
    const offset = i + 1
    let paramAddr

    const mode = paramModes[i] || 0
    if (mode === 0) {
      paramAddr = ram.instructionPointer + offset
      paramAddr = read(paramAddr)

    } else if (mode === 1) { // immediate mode
      paramAddr = ram.instructionPointer + offset
    } else if (mode === 2) { // relative mode
      paramAddr = ram.instructionPointer + offset
      paramAddr = ram.relativeBase + read(paramAddr)
    } else {
      throw new Error(`Unknown mode: ${mode}`)
    }

    return paramAddr
  })


  return {
    instructionPointer: ram.instructionPointer,
    relativeBase: ram.relativeBase,
    slice: ram.memory.slice(ram.instructionPointer),
    full: read(ram.instructionPointer),
    opCode,
    name,
    paramTypes,
    parameters,
    resolved,
  }
}


export function* intcode(
  m: Memory,
): Generator<number | undefined> {
  debug('intcode(%o, %o)', m)
  const ram: RAM = {
    memory: [...m],
    instructionPointer: 0,
    relativeBase: 0,
  }

  const addressNames: Record<number, string> = {}
  const getName = (addr: number) => {
    addressNames[addr] = addressNames[addr] || chance.word()
    return addressNames[addr] + `[${ram.memory[addr]}]`
  }
  const read = (i: number) => ram.memory[i] || 0

  do {
    const meta = debugOpCode(ram)

    debugOp('op', meta)

    switch (meta.opCode) {
      case OpCode.ADD: { // 1
        const [left, right, destAddress] = meta.resolved

        debug('%d: %s = %s + %s', meta.instructionPointer, getName(destAddress), getName(left), getName(right))
        ram.memory[destAddress] = read(left) + read(right)
        break;
      }
      case OpCode.MUL: { // 2
        const [left, right, destAddress] = meta.resolved
        debug('%d: %s = %s * %s', meta.instructionPointer, getName(destAddress), getName(left), getName(right))

        if (left * right > Number.MAX_VALUE) {
          throw new Error("Process as Infinity");
        }
        ram.memory[destAddress] = read(left) * read(right)
        break;
      }
      case OpCode.IN: { // 3
        // const destAddress = ram.memory[ram.instructionPointer + 1]
        const [destAddress] = meta.resolved
        const value = yield
        if (value == null) {
          throw new Error('Set called with an empty value')
        }
        if (typeof value !== 'number') {
          throw new Error(`Invalid value ${value}`)
        }

        debug('%d: %s = %s', meta.instructionPointer, getName(destAddress), getName(value))
        ram.memory[destAddress] = value
        break;
      }
      case OpCode.OUT: { // 4
        const [output] = meta.resolved
        debug('%d: output = %s', meta.instructionPointer, getName(output))
        yield read(output)
        break;
      }
      case OpCode.JMPT: { // 5
        const [value, destination] = meta.resolved
        debug('%d: if %s != 0 (%s)', meta.instructionPointer, getName(value), getName(meta.instructionPointer))
        if (read(value) != 0) {
          debug('  instructionPointer = %s', destination)
          ram.instructionPointer = read(destination)
        }
        break;
      }
      case OpCode.JMPF: { // 6
        const [value, destination] = meta.resolved

        debug('%d: if %s === 0 (%s)', meta.instructionPointer, getName(value), getName(meta.instructionPointer))
        if (read(value) === 0) {
          debug('  instructionPointer = %s', destination)
          ram.instructionPointer = read(destination)
        }
        break;
      }
      case OpCode.LT: { // 7
        const [left, right, address] = meta.resolved

        debug('%d: %s = (%s < %s)', meta.instructionPointer, getName(address), getName(left), getName(right))
        ram.memory[address] = (read(left) < read(right) ? 1 : 0)

        break;
      }
      case OpCode.EQ: { // 8
        const [left, right, address] = meta.resolved

        debug('%d: %s = (%s === %s)', meta.instructionPointer, getName(address), getName(left), getName(right))
        ram.memory[address] = (read(left) === read(right) ? 1 : 0)

        break;
      }
      case OpCode.REL: { // 9
        const [value] = meta.resolved
        ram.relativeBase += read(value)
        debug('%d: relativeBase += %s (%s)', meta.instructionPointer, getName(value), getName(ram.relativeBase))
        break;
      }
      case OpCode.END:
        return
      default:
        throw new Error(`Invalid op code at address ${ram.instructionPointer}: ${ram.memory[ram.instructionPointer]} `)
    }

    if (ram.instructionPointer === meta.instructionPointer) {
      ram.instructionPointer += meta.parameters.length + 1
    }
  } while (true)
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
  prefix: T[] = [],
  targetLength = items.length
): Generator<T[]> {
  if (prefix.length === targetLength) {
    yield prefix
  } else if (prefix.length > targetLength) {
    return
  }

  for (let i = 0; i < items.length; i++) {
    const rest = [...items]
    let [current] = rest.splice(i, 1)

    yield* permutationGenerator(rest, prefix.concat([current]), targetLength)
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
