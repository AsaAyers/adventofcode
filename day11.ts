import { parse, intcode } from './day7'

enum Color {
  Black = 0,
  White = 1,
}


type Hull = Record<string, {
  color: Color
  address: [number, number],
}>

export function emergencyHullPaintingRobot(program: string) {
  const memory = parse(program)
  const iterator = intcode(memory)

  let address: [number, number] = [0, 0]
  let direction = 0

  let current = iterator.next()
  const hull: Hull = {}
  hull['0,0'] = { color: Color.White, address }
  const readColor = (key: string) => (hull[key] != null && hull[key].color === Color.White ? Color.White : Color.Black)


  while (!current.done) {
    const [x, y] = address
    const key = `${x},${y}`
    console.log('current', current)

    current = iterator.next(readColor(key))
    console.log('color', current)
    switch (current.value) {
      case 1: hull[key] = { color: Color.White, address }; break;
      default:
      case 0: hull[key] = { color: Color.Black, address }; break;
    }
    current = iterator.next(readColor(key))
    console.log('direction', current)
    switch (current.value) {
      case 0: direction = (direction + 1) % 4; break;
      case 1: direction = (direction + 3) % 4; break;
      default:
        throw new Error(`Invalid direction: ${current.value}`)
    }

    switch (direction) {
      case 0: address = [x, y + 1]; break;
      case 1: address = [x - 1, y]; break;
      case 2: address = [x, y - 1]; break;
      case 3: address = [x + 1, y]; break;
      default:
        throw new Error(`Invalid direction ${direction}`)

    }


    current = iterator.next()

  }



  return hull
}

function paintHull(hull: Hull) {
  const { minx, miny, maxx, maxy } = Object.values(hull).reduce((memo, { address }) => {
    const [x, y,] = address
    if (x < memo.minx) {
      memo.minx = x
    }
    if (x > memo.maxx) {
      memo.maxx = x
    }

    if (y < memo.miny) {
      memo.miny = y
    }
    if (y > memo.maxy) {
      memo.maxy = y
    }

    return memo
  }, { minx: 0, miny: 0, maxx: 0, maxy: 0 })

  console.log({ minx, maxx, miny, maxy })

  let hullImg = ''
  for (let y = maxy; y >= miny; y--) {
    for (let x = minx; x <= maxx; x++) {
      const key = `${x},${y}`

      // console.log(key, hull[key])
      if (hull[key] != null && hull[key].color === Color.White) {
        hullImg += "\x1b[47m "
      } else {
        hullImg += "\x1b[40m "
      }
    }
    hullImg += '\n'
  }


  const reset = "\x1b[0m"
  return hullImg + reset
}


if (require.main === module) {
  const input = `
  3,8,1005,8,324,1106,0,11,0,0,0,104,1,104,0,3,8,102,-1,8,10,101,1,10,10,4,10,1008,8,0,10,4,10,1002,8,1,29,2,1102,17,10,3,8,102,-1,8,10,1001,10,1,10,4,10,1008,8,1,10,4,10,102,1,8,55,2,4,6,10,1,1006,10,10,1,6,14,10,3,8,1002,8,-1,10,101,1,10,10,4,10,1008,8,1,10,4,10,101,0,8,89,3,8,102,-1,8,10,1001,10,1,10,4,10,108,0,8,10,4,10,1002,8,1,110,1,104,8,10,3,8,1002,8,-1,10,1001,10,1,10,4,10,1008,8,1,10,4,10,102,1,8,137,2,9,17,10,2,1101,14,10,3,8,102,-1,8,10,101,1,10,10,4,10,1008,8,0,10,4,10,101,0,8,167,1,107,6,10,1,104,6,10,2,1106,6,10,3,8,1002,8,-1,10,101,1,10,10,4,10,108,1,8,10,4,10,1001,8,0,200,1006,0,52,1006,0,70,1006,0,52,3,8,102,-1,8,10,101,1,10,10,4,10,1008,8,1,10,4,10,1002,8,1,232,1006,0,26,1,104,19,10,3,8,102,-1,8,10,1001,10,1,10,4,10,108,0,8,10,4,10,102,1,8,260,1,2,15,10,2,1102,14,10,3,8,1002,8,-1,10,1001,10,1,10,4,10,108,0,8,10,4,10,1001,8,0,290,1,108,11,10,1006,0,36,1006,0,90,1006,0,52,101,1,9,9,1007,9,940,10,1005,10,15,99,109,646,104,0,104,1,21101,0,666412360596,1,21101,341,0,0,1105,1,445,21101,838366659476,0,1,21102,1,352,0,1106,0,445,3,10,104,0,104,1,3,10,104,0,104,0,3,10,104,0,104,1,3,10,104,0,104,1,3,10,104,0,104,0,3,10,104,0,104,1,21101,0,97713695975,1,21102,1,399,0,1106,0,445,21102,179469028392,1,1,21101,410,0,0,1105,1,445,3,10,104,0,104,0,3,10,104,0,104,0,21102,1,988220650260,1,21101,433,0,0,1105,1,445,21101,0,838345843560,1,21101,444,0,0,1106,0,445,99,109,2,22101,0,-1,1,21102,1,40,2,21102,1,476,3,21101,466,0,0,1106,0,509,109,-2,2105,1,0,0,1,0,0,1,109,2,3,10,204,-1,1001,471,472,487,4,0,1001,471,1,471,108,4,471,10,1006,10,503,1101,0,0,471,109,-2,2106,0,0,0,109,4,1202,-1,1,508,1207,-3,0,10,1006,10,526,21101,0,0,-3,22101,0,-3,1,22102,1,-2,2,21102,1,1,3,21101,0,545,0,1106,0,550,109,-4,2105,1,0,109,5,1207,-3,1,10,1006,10,573,2207,-4,-2,10,1006,10,573,21201,-4,0,-4,1106,0,641,21201,-4,0,1,21201,-3,-1,2,21202,-2,2,3,21102,592,1,0,1106,0,550,21201,1,0,-4,21101,0,1,-1,2207,-4,-2,10,1006,10,611,21101,0,0,-1,22202,-2,-1,-2,2107,0,-3,10,1006,10,633,22102,1,-1,1,21102,1,633,0,106,0,508,21202,-2,-1,-2,22201,-4,-2,-4,109,-5,2105,1,0
  `

  const hull = emergencyHullPaintingRobot(input)

  console.log('phase1', Object.values(hull).length)
  console.log(Object.entries(hull).filter(([k, h]) => h.color === Color.White))
  console.log(paintHull(hull))





}
