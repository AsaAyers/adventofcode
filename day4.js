function test(fn, inputs, expected) {
  try {
    const actual = fn(...inputs)

    if (actual !== expected) {
      throw new Error(`Actual: ${actual}\nExpected: ${expected}`)
    }
  } catch (e) {
    console.log(`Error: \n${inputs.join('\n')}`)
    throw e
  }
}


const double = /(\d)\1/

function isValid(password) {
  password = String(password)
  for (var i = 1; i < password.length; i++) {
    if (password[i] < password[i - 1]) {
      return false
    }
  }

  return (
    password.length === 6
    && double.exec(password) != null
  )
}

test(isValid, [111111], true)
test(isValid, [223450], false)
test(isValid, [123789], false)

console.log('Tests passed')

function part1(start, end) {
  let total = 0
  for (var i = start; i <= end; i++) {
    if (isValid(i)) {
      total++
    }
  }
  return total
}

console.log('part1', part1(273025, 767253))


function part2(start, end) {
  let total = 0

  for (var i = start; i <= end; i++) {
    if (isValid(i)) {
      const tripplesRemoved = String(i).replace(
        /(\d)\1\1+/g,
        "|"
      )

      if (double.exec(tripplesRemoved) != null) {
        total++
      }
    }
  }
  return total
}

console.log('part2', part2(273025, 767253))
