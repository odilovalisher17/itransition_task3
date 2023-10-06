const crypto = require("crypto");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let moves = process.argv.slice(2);
let HMAC_KEY;

if (moves.length < 2 || moves.length % 2 === 0) {
  console.log(
    "Please enter an odd number of moves (at least three) as command-line arguments."
  );
  process.exit(1);
}

if (
  moves.reduce((total, cValue, cIndex) => {
    return (
      total || moves.filter((el, index) => index !== cIndex).includes(cValue)
    );
  }, false)
) {
  console.log("All moves should be diffrent!");
  process.exit(1);
}

const winningMoves = {};
for (let i = 0; i < moves.length; i++) {
  const currentMove = moves[i];
  const beats = moves.slice(i + 1).concat(moves.slice(0, i));
  winningMoves[currentMove] = beats.slice(
    Math.ceil(beats.length / 2),
    beats.length
  );
}

function createRandomHMACKey(length) {
  const characters = "0123456789ABCDEF";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}
HMAC_KEY = createRandomHMACKey(64);

function getHMAC(secretKey, message) {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);

  const hexHmac = hmac.digest("hex");
  console.log("HMAC : " + hexHmac.toLocaleUpperCase());
}

function getRandomMove() {
  const randomIndex = Math.floor(Math.random() * moves.length);
  return moves[randomIndex];
}

function determineWinner(playerMove, computerMove) {
  if (playerMove === computerMove) return "It's a draw!";

  if (winningMoves[playerMove].includes(computerMove)) {
    return "You win!";
  } else {
    return "Computer wins!";
  }
}

function createTable() {
  const data = [
    ["v PC\\User >", ...moves],
    ...moves.map((el) => [
      el,
      ...moves.map((m) => {
        if (el === m) {
          return "Draw";
        } else if (winningMoves[el].includes(m)) {
          return "Win";
        } else {
          return "Lose";
        }
      }),
    ]),
  ];

  // Calculate the maximum width for each column
  const columnWidths = data[0].map((_, columnIndex) => {
    return Math.max(...data.map((row) => row[columnIndex].length));
  });

  // Generate the table separator with only hyphens
  const separator =
    "+" + columnWidths.map((width) => "-".repeat(width + 2)).join("+") + "+";

  // Generate the table rows with lines between them
  const tableRows = data.map((row, rowIndex) => {
    const rowText =
      "|" +
      row
        .map((cell, columnIndex) => {
          return ` ${cell.padEnd(columnWidths[columnIndex])} `;
        })
        .join("|") +
      "|";

    if (rowIndex === 0) {
      return [separator, rowText, separator].join("\n");
    } else {
      return [rowText, separator].join("\n");
    }
  });

  // Combine everything into a table
  const table = tableRows.join("\n");

  console.log(table);
}

function startGame() {
  const computerMove = getRandomMove();
  getHMAC(HMAC_KEY, computerMove);

  console.log("Available moves:");
  moves.forEach((move, index) => {
    console.log(`${index + 1} - ${move}`);
  });
  console.log("0 - exit");
  console.log("? - help");

  rl.question("Enter your move:\n> ", (input) => {
    if (input === "0") {
      rl.close();
    } else if (input === "?") {
      createTable();
      startGame();
    } else if (input >= 1 && input <= moves.length) {
      const playerMove = moves[input - 1];
      console.log(`Your move: ${playerMove}`);
      console.log(`Computer move: ${computerMove}`);
      console.log(determineWinner(playerMove, computerMove));

      console.log("HMAC key : " + HMAC_KEY);
      process.exit();
    } else {
      console.log("Invalid input. Please try again.");
      startGame();
    }
  });
}

startGame();
