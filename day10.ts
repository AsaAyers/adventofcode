
type Asteroid = {
  x: number, y: number
}

export function parse(str: string): Asteroid[] {
  const rows = str.trim().split('\n')

  let asteroids = []
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y].trim()
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#') {
        asteroids.push({ x, y })
      }
    }
  }

  return asteroids
}

const manhattanDistance = (a: Asteroid, b: Asteroid) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

const getAngle = (a: Asteroid, b: Asteroid) => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
  const angle = Math.atan2((b.x - a.x),  (a.y - b.y)) * 180 / Math.PI;

  // I want the angles to go all the way around, to make it easier to know what order
  // they will be shot in phase 2
  if (angle < 0) {
    return 360 + angle
  }

  return angle
}

type BySlope = Record<number, {
  distance: number,
  asteroid: Asteroid,
}>
export function visibleAsteroids(current: Asteroid, asteroids: Asteroid[]): BySlope {
  return asteroids.reduce((bySlope, asteroid) => {
    // Don't count yourself
    if (current.x != asteroid.x || current.y != asteroid.y) {
      const slope = getAngle(current, asteroid)
      const distance = manhattanDistance(current, asteroid)
      if (bySlope[slope] == null || bySlope[slope].distance >  distance) {
        bySlope[slope] = { distance, asteroid }
      }
    }

    return bySlope
  }, {} as BySlope)
}

export function numVisible(current: Asteroid, asteroids: Asteroid[]): number {
  const bySlope = visibleAsteroids(current, asteroids)
  return Object.keys(bySlope).length
}

export function bestVisibility(asteroids: Asteroid[]) {
  return asteroids.reduce((current, asteroid) => {
    const n = numVisible(asteroid, asteroids)
    if (n > current.best) {
      return {
        best: n,
        asteroid,
      }
    }

    return current
  }, { best: 0, asteroid: asteroids[0] })
}

const numericSort = (a: number, b: number) => a - b
export function* laser(current: Asteroid, a: Asteroid[]) {
  let asteroids = [...a]

  while (asteroids.length > 1) {
    const visible = visibleAsteroids(current, asteroids)
    const keys = Object.keys(visible).map(Number).sort(numericSort)
    const targets = keys.map(k => visible[k].asteroid)

    for (let i = 0; i < keys.length; i++) {
      // console.log(keys[i], targets[i])
      yield targets[i]
    }

    asteroids = asteroids.filter(a => !targets.includes(a))
  }
}

if (require.main === module) {
  const input = `
  .##.#.#....#.#.#..##..#.#.
  #.##.#..#.####.##....##.#.
  ###.##.##.#.#...#..###....
  ####.##..###.#.#...####..#
  ..#####..#.#.#..#######..#
  .###..##..###.####.#######
  .##..##.###..##.##.....###
  #..#..###..##.#...#..####.
  ....#.#...##.##....#.#..##
  ..#.#.###.####..##.###.#.#
  .#..##.#####.##.####..#.#.
  #..##.#.#.###.#..##.##....
  #.#.##.#.##.##......###.#.
  #####...###.####..#.##....
  .#####.#.#..#.##.#.#...###
  .#..#.##.#.#.##.#....###.#
  .......###.#....##.....###
  #..#####.#..#..##..##.#.##
  ##.#.###..######.###..#..#
  #.#....####.##.###....####
  ..#.#.#.########.....#.#.#
  .##.#.#..#...###.####..##.
  ##...###....#.##.##..#....
  ..##.##.##.#######..#...#.
  .###..#.#..#...###..###.#.
  #..#..#######..#.#..#..#.#
  `

  const asteroids = parse(input)

  const phase1 = bestVisibility(asteroids)
  console.log('phase1', phase1)

  let count = 0
  for (let asteroid of laser(phase1.asteroid, asteroids)) {
    count++
    if (count === 200) {
      console.log('phase2', (asteroid.x * 100) + asteroid.y)
    }
  }
}
