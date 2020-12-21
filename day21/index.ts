import { resolve } from "dns";
import { runTests, test } from "../common";

function parse(str: string) {
  return str
    .trim()
    .split("\n")
    .map((line) => {
      const words = line.replace(")", "").split(/[,\s]+/);
      const i = words.indexOf("(contains");

      return {
        ingredients: words.slice(0, i),
        allergens: words.slice(i + 1),
      };
    });
}
type Input = ReturnType<typeof parse>;

function groupRecipiesByAllergen(recipes: Input) {
  return recipes.reduce((map, { ingredients, allergens }) => {
    return allergens.reduce((map, name) => {
      map[name] = map[name] || [];
      map[name].push(ingredients);
      return map;
    }, map);
  }, {} as Record<string, string[][]>);
}

const findCommon = (items: string[][]) => {
  const first = items[0];

  return first.filter((tmp) => items.every((list) => list.includes(tmp)));
};

function part1(input: Input): any {
  const allergenMap = groupRecipiesByAllergen(input);
  const allergens = Object.keys(allergenMap);
  const resolved: string[] = [];

  const possibleAllergens = Object.fromEntries(
    Object.entries(allergenMap).map(([name, allergens]) => {
      return [name, findCommon(allergens)];
    })
  );

  while (allergens.length > resolved.length) {
    for (const name in possibleAllergens) {
      console.log(name, possibleAllergens[name]);
      const tmp = possibleAllergens[name].filter(
        (item) => !resolved.includes(item)
      );

      if (tmp.length === 1) {
        resolved.push(tmp[0]);
        console.log("resolved", tmp);
      }
      possibleAllergens[name] = tmp;
    }
  }

  console.log(resolved);
  return input.reduce((total, item) => {
    return (
      total + item.ingredients.filter((tmp) => !resolved.includes(tmp)).length
    );
  }, 0);
  // return allergens.map((name) => {
  //   return findCommon(allergenMap[name]);
  // });
}
function part2(input: Input): any {
  return input;
}

if (require.main === module) {
  console.clear();
  const part1Example = `

mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
trh fvjkl sbzzf mxmxvkd (contains dairy)
sqjhc fvjkl (contains soy)
sqjhc mxmxvkd sbzzf (contains fish)

  `;
  const part2Example = ``;
  test({
    label: "exampleInput",
    parse,
    input: part1Example,
    expect: 5,
    func: part1,
  });

  test({
    label: "Part 1",
    parse,
    func: part1,
  });

  test({
    label: "Part 2 Example",
    parse,
    input: part2Example || part1Example,
    expect: 0,
    func: part2,
  });

  test({
    label: "Part 2",
    parse,
    func: part2,
  });

  runTests(__dirname);
}
