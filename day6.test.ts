import { parse, orbitCounter, totalOrbits, orbitalTransfers } from './day6'

describe('day6-1', () => {
  const example = `
  B)C
  C)D
  D)E
  E)F
  B)G
  G)H
  D)I
  E)J
  J)K
  K)L
  COM)B
  `

  test.each([
    ['D', 3],
    ['L', 7],
    ['COM', 0]

  ])('%s orbits %d', (name, expected) => {
    const orbitMap = parse(example)
    expect(orbitCounter(orbitMap[name])).toBe(expected)
  })

  test('total orbits = 42', () => {
    const orbitMap = parse(example)
    expect(totalOrbits(orbitMap)).toBe(42)

  })
})

describe('day6-2', () => {
  const example = `
  COM)B
  B)C
  C)D
  D)E
  E)F
  B)G
  G)H
  D)I
  E)J
  J)K
  K)L
  K)YOU
  I)SAN
  `

  test('orbitalTransfers', () => {

    const orbitMap = parse(example)
    expect(orbitalTransfers(orbitMap.YOU, orbitMap.SAN)).toBe(4)


  })
})
