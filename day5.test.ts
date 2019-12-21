import { parse, intcode } from './day5'



describe('day5-1', () => {

  test('test1', () => {
    const actual = intcode(parse('3,0,4,0,99'), [25])
    expect(actual).toBe(25)
  })


  test('test2', () => {
    const actual = intcode(parse('1101,100,-1,4,0'))
    if (!Array.isArray(actual)) {
      throw new Error('Expected array')
    }
    expect(actual[4]).toBe(99)
  })

})

describe('day5-2', () => {
  const posEqual8 = '3,9,8,9,10,9,4,9,99,-1,8' //- Using position mode, consider whether the input is equal to 8; output 1 (if it is) or 0 (if it is not).
  const posLessThan8 = '3,9,7,9,10,9,4,9,99,-1,8' //- Using position mode, consider whether the input is less than 8; output 1 (if it is) or 0 (if it is not).
  const immEqual8 = '3,3,1108,-1,8,3,4,3,99' //- Using immediate mode, consider whether the input is equal to 8; output 1 (if it is) or 0 (if it is not).
  const immLessThan8 = '3,3,1107,-1,8,3,4,3,99' //- Using immediate mode, consider whether the input is less than 8; output 1 (if it is) or 0 (if it is not).


  const posNotZero = '3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9' // (using position mode)
  const immNotZero = '3,3,1105,-1,9,1101,0,0,12,4,12,99,1' // (using immediate mode)


  test.only('test1', () => {

    expect(intcode(parse(posEqual8), [7])).toBe(0)
    expect(intcode(parse(posEqual8), [8])).toBe(1)
    expect(intcode(parse(posEqual8), [9])).toBe(0)

    expect(intcode(parse(immEqual8), [7])).toBe(0)
    expect(intcode(parse(immEqual8), [8])).toBe(1)
    expect(intcode(parse(immEqual8), [9])).toBe(0)


    expect(intcode(parse(posLessThan8), [7])).toBe(1)
    expect(intcode(parse(posLessThan8), [8])).toBe(0)

    expect(intcode(parse(immLessThan8), [7])).toBe(1)
    expect(intcode(parse(immLessThan8), [8])).toBe(0)

    expect(intcode(parse(posNotZero), [5])).toBe(1)
    expect(intcode(parse(posNotZero), [0])).toBe(0)

    expect(intcode(parse(immNotZero), [5])).toBe(1)
    expect(intcode(parse(immNotZero), [0])).toBe(0)

    const big8 = `
      3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,
      1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,
      999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99
    `

    expect(intcode(parse(big8), [7])).toBe(999)
    expect(intcode(parse(big8), [8])).toBe(1000)
    expect(intcode(parse(big8), [9])).toBe(1001)

  })


})
