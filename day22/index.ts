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

type Game = {
  id: string;
  player1: number[];
  player2: number[];
  history: string[];
  winner?: 1 | 2;
};

function scoreDeck(deck: Deck) {
  return deck.reduce((sum, card, index) => {
    const m = deck.length - index;
    return sum + card * m;
  }, 0);
}

const deckHash = (player1: Deck, player2: Deck) =>
  scoreDeck(player1) + ":" + scoreDeck(player2);

function combat(game: Game, recursive = false): void {
  const { player1, player2 } = game;

  const h1 = deckHash(game.player1, game.player2);
  if (game.history.includes(h1)) {
    game.winner = 1;
    // console.log("loop 1", h1, h1, game.history);
    return;
  }
  game.history.push(h1);

  const card1 = player1.shift()!;
  const card2 = player2.shift()!;
  console.log("cards:", game.id, game.history.length, card1, card2);

  if (recursive) {
    // If both players have at least as many cards remaining in their deck as
    // the value of the card they just drew, the winner of the round is
    // determined by playing a new game of Recursive Combat (see below).
    if (player1.length >= card1 && player2.length >= card2) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const minigame = playGame(
        player1.slice(0, card1),
        player2.slice(0, card2),
        false
      );
      // console.log("recursive....", game.id, minigame.id);

      if (minigame.winner == 1) {
        player1.push(card1, card2);
      } else {
        player2.push(card2, card1);
      }
      return;
    }
  }

  if (card1 > card2) {
    player1.push(card1, card2);
  } else {
    player2.push(card2, card1);
  }
}

let gameId = 1;
function playGame(player1: Deck, player2: Deck, recursive = false): Game {
  const game: Game = {
    id: String(gameId++),
    player1: [...player1],
    player2: [...player2],
    history: [],
  };
  console.log("playGame", game.id);

  while (game.winner === undefined) {
    combat(game, recursive);
    if (game.player1.length === 0) {
      game.winner = 2;
    } else if (game.player2.length === 0) {
      game.winner = 1;
    }
  }

  return game;
}

function part1(input: Input): any {
  const { player1, player2 } = playGame(input[0], input[1]);

  return scoreDeck(player1) + scoreDeck(player2);
}
function part2(input: Input): any {
  gameId = 1;
  const { player1, player2 } = playGame(input[0], input[1], true);

  console.log(player1, player2);
  const score = scoreDeck(player1) + scoreDeck(player2);

  if (score === 33558) {
    throw new Error(`wrong answer: ${score}`);
  }

  return score;
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
    expect: 291,
    func: part2,
  });

  test({
    label: "Part 2",
    parse,
    func: part2,
  });

  runTests(__dirname);
}
