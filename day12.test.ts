import { energyAfterSteps, Moon, periodicSteps } from './day12'


test('example1', () => {
  const moons = [
    new Moon("Io", -1, 0, 2),
    new Moon("Europa", 2, -10, -7),
    new Moon("Ganymede", 4, -8, 8),
    new Moon("Callisto", 3, 5, -1),
  ]
  expect(energyAfterSteps(10, moons)).toBe(179)
  expect(periodicSteps(moons)).toBe(2772)
})

test('example2', () => {

  const moons = [
    new Moon("Io", -8, -10, 0),
    new Moon("Europa", 5, 5, 10),
    new Moon("Ganymede", 2, -7, 3),
    new Moon("Callisto", 9, -8, -3),
  ]
  expect(energyAfterSteps(100, moons)).toBe(1940)
  // expect(periodicSteps(moons)).toBe(4686774924)
})
