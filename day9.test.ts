import { parse, intcode } from './day7'

function collectOutput(program: string) {
  const memory = parse(program)

  const iterator = intcode(memory)

  const out = []
  for (let current of iterator) {
    out.push(current)
  }
  return out
}

test('quine', () => {
  const program = `
  109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99
  `.trim()

  expect(collectOutput(program).join(',')).toBe(program)
})

test('examples', () => {
  const tmp = collectOutput(`1102,34915192,34915192,7,4,7,99,0`)
  expect(tmp.join('').length).toBe(16)

  expect(collectOutput(`104,1125899906842624,99`)).toMatchObject([
    1125899906842624
  ])
})
