import { performance } from 'perf_hooks'
import { debuglog } from 'util'

const debug = debuglog('day12')

type Velocity = {
  x: number,
  y: number,
  z: number,
}

export class Moon {
  velocity = { x: 0, y: 0, z: 0 }

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
  ) { }

  public clone(): Moon {
    const clone = new Moon(this.name, this.x, this.y, this.z)
    clone.velocity = {
      x: this.velocity.x,
      y: this.velocity.y,
      z: this.velocity.z,
    }
    return clone
  }

  public isSamePositionAndVelocity(moon: Moon) {
    return (
      moon.x === this.x
      && moon.y === this.y
      && moon.z === this.z
      && moon.velocity.x === this.velocity.x
      && moon.velocity.y === this.velocity.y
      && moon.velocity.z === this.velocity.z
    )
  }

  public potentialEnergy() {
    return Math.abs(this.x)
      + Math.abs(this.y)
      + Math.abs(this.z)
  }
  public kineticEnergy() {
    return Math.abs(this.velocity.x)
      + Math.abs(this.velocity.y)
      + Math.abs(this.velocity.z)
  }

  public toString(): string {
    const str = `pos=<x=${this.x}, y=${this.y}, z=${this.z}>` +
      ` vel=<x=${this.velocity.x}, y=${this.velocity.y}, z=${this.velocity.z}> ${this.name}`
    return str
  }
}

function gravity(a: Moon, b: Moon, axis: keyof Velocity) {
  if (a[axis] < b[axis]) {
    // console.log(axis, a.name, a[axis], '<', b.name, b[axis])
    a.velocity[axis]++
    b.velocity[axis]--
  } else if (a[axis] > b[axis]) {
    // console.log(axis, a.name, a[axis], '<', b.name, b[axis])
    a.velocity[axis]--
    b.velocity[axis]++
  }
}

function move(moon: Moon) {
  moon.x += moon.velocity.x
  moon.y += moon.velocity.y
  moon.z += moon.velocity.z
}

function timeStep(moons: Moon[]) {
  for (let i = 0; i < moons.length; i++) {
    for (let j = i + 1; j < moons.length; j++) {
      gravity(moons[i], moons[j], 'x')
      gravity(moons[i], moons[j], 'y')
      gravity(moons[i], moons[j], 'z')
    }
    move(moons[i])
  }
}

function logStep(steps: number, moons: Moon[]) {
  debug(
    `After %d steps\n%s\n`,
    steps,
    moons.map(String).join('\n')
  )
}

export function energyAfterSteps(maxSteps: number, originalMoons: Moon[]) {
  const moons = originalMoons.map(m => m.clone())
  logStep(0, moons)
  for (let steps = 1; steps <= maxSteps; steps++) {
    timeStep(moons)
    logStep(steps, moons)
  }

  return moons.reduce((total, m) => {
    const pot = m.potentialEnergy()
    const kin = m.kineticEnergy()

    debug('pot: ', pot, 'kin: ', kin, 'total: ', pot * kin)

    return total + (pot * kin)
  }, 0)
}

const timeout = 15000
export function periodicSteps(moons: Moon[]) {
  const start = performance.now()
  const clones = moons.map(m => m.clone())

  const allSame = () => {
    for (let i = 0; i < clones.length; i++) {
      if (!clones[i].isSamePositionAndVelocity(moons[i])) {
        return false
      }
    }
    return true
  }

  let steps = 0
  do {
    timeStep(clones)
    steps++

    if (performance.now() - start > timeout) {
      throw new Error(`Timeout: ${steps} steps - ${Math.floor(steps / (timeout / 1000))} steps/second`)
    }
  } while (!allSame())
  return steps
}



if (require.main === module) {
  const moons = [
    new Moon("Io", 5, -1, 5),
    new Moon("Europa", 0, -14, 2),
    new Moon("Ganymede", 16, 4, 0),
    new Moon("Callisto", 18, 1, 16),
  ]
  const total = energyAfterSteps(1000, moons)
  console.log('phase1', total)
  // console.log('phase2', periodicSteps(moons))


  {
    const moons = [
      new Moon("Io", -8, -10, 0),
      new Moon("Europa", 5, 5, 10),
      new Moon("Ganymede", 2, -7, 3),
      new Moon("Callisto", 9, -8, -3),
    ]
    console.log(periodicSteps(moons))
  }

}
