import { runTests, test } from "../common";

function parse(str: string) {
  const lines = str
    .trim()
    .split("\n")
    .filter((str) => str != "");
  const p2 = lines.indexOf("Player 2:");

  return [lines.slice(1, p2).map(Number), lines.slice(p2 + 1).map(Number)];
}
type Deck = number[];
type Input = ReturnType<typeof parse>;

function combat(player1: Deck, player2: Deck) {
  const card1 = player1.shift()!;
  const card2 = player2.shift()!;

  console.log("cards:", card1, card2);
  if (card1 > card2) {
    player1.push(card1, card2);
  } else {
    player2.push(card2, card1);
  }
}

function scoreDeck(deck: Deck) {
  return deck.reduce((sum, card, index) => {
    const m = deck.length - index;
    return sum + card * m;
  }, 0);
}

function part1([player1, player2]: Input): any {
  while (player1.length > 0 && player2.length > 0) {
    combat(player1, player2);
  }

  return scoreDeck(player1) + scoreDeck(player2);
}
function part2(input: Input): any {
  return input;
}

if (require.main === module) {
  console.clear();
  const part1Example = `
  Player 1:
9
2
6
3
1

Player 2:
5
8
4
7
10

  `;
  const part2Example = ``;
  test({
    label: "exampleInput",
    parse,
    input: part1Example,
    expect: 306,
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
