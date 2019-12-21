import { debuglog } from 'util'

const debug = debuglog('intcode')
const debugParams = debuglog('intcode:params')

type Memory = Array<number>
export const parse = (str: string): Memory => str.split(',').map(Number)

export function intcode(m: Memory, register?: number) {
  debug('intcode(%o, %o)', m, register)
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

    debug('opCode', memory[instructionPointer], register, memory)
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
        if (register == null) {
          throw new Error('Set called with an empty register')
        }

        debug('set memory[%d] = %d', destAddress, register)
        memory[destAddress] = register
        pointerMove = 2
        break;
      }
      case 4: { // Get
        register = paramValue(1)
        debug('get register = %d', register)
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



  if (register != null) {
    debug('return register', register)
    return register
  }
  return memory
}




const input = `3,225,1,225,6,6,1100,1,238,225,104,0,1101,48,82,225,102,59,84,224,1001,224,-944,224,4,224,102,8,223,223,101,6,224,224,1,223,224,223,1101,92,58,224,101,-150,224,224,4,224,102,8,223,223,1001,224,3,224,1,224,223,223,1102,10,89,224,101,-890,224,224,4,224,1002,223,8,223,1001,224,5,224,1,224,223,223,1101,29,16,225,101,23,110,224,1001,224,-95,224,4,224,102,8,223,223,1001,224,3,224,1,223,224,223,1102,75,72,225,1102,51,8,225,1102,26,16,225,1102,8,49,225,1001,122,64,224,1001,224,-113,224,4,224,102,8,223,223,1001,224,3,224,1,224,223,223,1102,55,72,225,1002,174,28,224,101,-896,224,224,4,224,1002,223,8,223,101,4,224,224,1,224,223,223,1102,57,32,225,2,113,117,224,101,-1326,224,224,4,224,102,8,223,223,101,5,224,224,1,223,224,223,1,148,13,224,101,-120,224,224,4,224,1002,223,8,223,101,7,224,224,1,223,224,223,4,223,99,0,0,0,677,0,0,0,0,0,0,0,0,0,0,0,1105,0,99999,1105,227,247,1105,1,99999,1005,227,99999,1005,0,256,1105,1,99999,1106,227,99999,1106,0,265,1105,1,99999,1006,0,99999,1006,227,274,1105,1,99999,1105,1,280,1105,1,99999,1,225,225,225,1101,294,0,0,105,1,0,1105,1,99999,1106,0,300,1105,1,99999,1,225,225,225,1101,314,0,0,106,0,0,1105,1,99999,8,677,226,224,102,2,223,223,1006,224,329,101,1,223,223,107,677,677,224,1002,223,2,223,1006,224,344,101,1,223,223,8,226,677,224,102,2,223,223,1006,224,359,101,1,223,223,107,226,226,224,102,2,223,223,1005,224,374,1001,223,1,223,1108,677,226,224,1002,223,2,223,1006,224,389,101,1,223,223,107,677,226,224,102,2,223,223,1006,224,404,1001,223,1,223,1107,226,677,224,1002,223,2,223,1006,224,419,1001,223,1,223,108,677,677,224,102,2,223,223,1005,224,434,1001,223,1,223,1008,677,226,224,1002,223,2,223,1006,224,449,1001,223,1,223,7,226,677,224,1002,223,2,223,1006,224,464,1001,223,1,223,1007,677,677,224,102,2,223,223,1005,224,479,1001,223,1,223,1007,226,226,224,1002,223,2,223,1005,224,494,1001,223,1,223,108,226,226,224,1002,223,2,223,1005,224,509,1001,223,1,223,1007,226,677,224,1002,223,2,223,1006,224,524,101,1,223,223,1107,677,677,224,102,2,223,223,1005,224,539,101,1,223,223,1107,677,226,224,102,2,223,223,1005,224,554,1001,223,1,223,108,677,226,224,1002,223,2,223,1006,224,569,1001,223,1,223,1108,226,677,224,1002,223,2,223,1006,224,584,101,1,223,223,8,677,677,224,1002,223,2,223,1006,224,599,1001,223,1,223,1008,226,226,224,102,2,223,223,1006,224,614,101,1,223,223,7,677,677,224,1002,223,2,223,1006,224,629,101,1,223,223,1008,677,677,224,102,2,223,223,1005,224,644,101,1,223,223,7,677,226,224,1002,223,2,223,1005,224,659,101,1,223,223,1108,226,226,224,102,2,223,223,1006,224,674,1001,223,1,223,4,223,99,226`




if (require.main === module) {
  console.log('part1', intcode(parse(input), 1))
  console.log('part2', intcode(parse(input), 5))
}

// debug('%o',
//   intcode(parse('3,9,8,9,10,9,4,9,99,-1,8'), 8)
// )
