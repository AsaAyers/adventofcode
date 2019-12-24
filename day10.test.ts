import { parse, numVisible, bestVisibility, laser } from './day10'

test('phase1', () => {

  const map = `
  .#..#
  .....
  #####
  ....#
  ...##
  `

  const asteroids = parse(map)

  expect(asteroids).toMatchObject([
    { x: 1, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
  ])

  expect(
    asteroids.map((current) => numVisible(current, asteroids))
  ).toMatchObject([
    7, 7,
    6,7,7,7,5,
    7,
    8,7
  ])

  expect(
    bestVisibility(asteroids)
  ).toMatchObject( {
    best: 8,
    asteroid: { x: 3, y: 4 },
  })

})

test('phase2', () => {
  const asteroids = parse(`
    .#..##.###...#######
    ##.############..##.
    .#.######.########.#
    .###.#######.####.#.
    #####.##.#.##.###.##
    ..#####..#.#########
    ####################
    #.####....###.#.#.##
    ##.#################
    #####.##.###..####..
    ..######..##.#######
    ####.##.####...##..#
    .#####..#.######.###
    ##...#.##########...
    #.##########.#######
    .####.#.###.###.#.##
    ....##.##.###..#####
    .#.#.###########.###
    #.#.#.#####.####.###
    ###.##.####.##.#..##
  `)

  const best = asteroids.find(a => a.x === 11 && a.y === 13)
  if (!best) {
    throw new Error('Missing best?')
  }

  let count = 0
  for (let asteroid of laser(best, asteroids)) {
    count++

    switch (count) {
      case 1: expect(asteroid).toMatchObject({ x: 11, y: 12}); break;
      case 2: expect(asteroid).toMatchObject({ x: 12, y: 1}); break;
      case 3: expect(asteroid).toMatchObject({ x: 12, y: 2}); break;
      case 10: expect(asteroid).toMatchObject({ x: 12, y: 8}); break;
      case 20: expect(asteroid).toMatchObject({ x: 16, y: 0}); break;
      case 50: expect(asteroid).toMatchObject({ x: 16, y: 9}); break;
      case 100: expect(asteroid).toMatchObject({ x: 10, y: 16}); break;
      case 199: expect(asteroid).toMatchObject({ x: 9, y: 6}); break;
      case 200: expect(asteroid).toMatchObject({ x: 8, y: 2}); break;
      case 201: expect(asteroid).toMatchObject({ x: 10, y: 9}); break;
      case 299: expect(asteroid).toMatchObject({ x: 11, y: 1}); break;
      default:

    }
  }
})
