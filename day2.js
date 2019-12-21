
const parse = (str) => str.split(',').map(Number)

function intcode(m) {
  const memory = [...m]

  let instructionPointer = 0

  while (memory[instructionPointer] !== 99) {
    switch (memory[instructionPointer]) {
      case 1: {
        const lAddress = memory[instructionPointer + 1]
        const rAddress = memory[instructionPointer + 2]
        const destAddress = memory[instructionPointer + 3]

        memory[destAddress] = memory[lAddress] + memory[rAddress]
        instructionPointer += 4
        break;
      }
      case 2: {
        const lAddress = memory[instructionPointer + 1]
        const rAddress = memory[instructionPointer + 2]
        const destAddress = memory[instructionPointer + 3]
        memory[destAddress] = memory[lAddress] * memory[rAddress]
        instructionPointer += 4
        break;
      }
      case 99:
        break;
      default:
        throw new Error(`Invalid op code at address ${instructionPointer}: ${memory[instructionPointer]}`)
    }


  }


  return memory
}



function test(input, expected) {

  try {
    const memory = parse(input)
    const actual = intcode(memory).join(',')
    if (actual !== expected) {
      throw new Error(`Error running ${input}\nActual: ${actual}\nExpected: ${expected}`)
    }
  } catch (e) {
    console.error(`Error running ${input}`)
    throw e
  }

}


test('1,0,0,0,99', '2,0,0,0,99')
test('2,3,0,3,99', '2,3,0,6,99')
test('2,4,4,5,99,0', '2,4,4,5,99,9801')
test('1,1,1,4,99,5,6,0,99', '30,1,1,4,2,5,6,0,99')

console.log('Tests passed')


const input = `1,0,0,3,1,1,2,3,1,3,4,3,1,5,0,3,2,13,1,19,1,9,19,23,2,23,13,27,1,27,9,31,2,31,6,35,1,5,35,39,1,10,39,43,2,43,6,47,1,10,47,51,2,6,51,55,1,5,55,59,1,59,9,63,1,13,63,67,2,6,67,71,1,5,71,75,2,6,75,79,2,79,6,83,1,13,83,87,1,9,87,91,1,9,91,95,1,5,95,99,1,5,99,103,2,13,103,107,1,6,107,111,1,9,111,115,2,6,115,119,1,13,119,123,1,123,6,127,1,127,5,131,2,10,131,135,2,135,10,139,1,13,139,143,1,10,143,147,1,2,147,151,1,6,151,0,99,2,14,0,0`

const part1 = parse(input)
part1[1] = 12
part1[2] = 2

function gravityAssist(noun, verb) {
  const memory = parse(input)
  memory[1] = noun
  memory[2] = verb
  return intcode(memory)[0]
}

console.log('part1', gravityAssist(12, 2))

const target = 19690720
let noun = 0
let verb = 0

let i
let value = gravityAssist(noun, verb)

const nounDistance = gravityAssist(noun + 1, verb) - value
const verbDistance = gravityAssist(noun, verb + 1) - value

do {
  const distance = target - value

  if (distance >= nounDistance) {
    noun++
  } else if (distance >= verbDistance) {
    verb++
  } else {
    throw new Error()
  }


  value = gravityAssist(noun, verb)
  console.log(noun, verb, value)
} while (value != target)

console.log('done', value)
