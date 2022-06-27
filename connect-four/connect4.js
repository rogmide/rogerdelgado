/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

let WIDTH = 7;
let HEIGHT = 6;

let currPlayer = 'blue'; // active player: 1 or 2
let board = []; // array of rows, each row is array of cells  (board[y][x])

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
  // TODO: set "board" to empty HEIGHT x WIDTH matrix array
  for (let y = 0; y < HEIGHT; y++) {
    board.push(Array.from({ length: WIDTH }));
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  // TODO: get "htmlBoard" variable from the item in HTML w/ID of "board"
  const htmlBoard = document.querySelector('#board');
  // TODO: add comment for this code
  // Create a table
  // Add attribute "id" + "column-top" to get the hover effect
  // Add event listener to the top header
  let top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);  

  // Create the top of the board
  for (let x = 0; x < WIDTH; x++) {
    let headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  htmlBoard.append(top);

  // TODO: add comment for this code
  // Make the board using the "HEIGHT" creating TD Element using the "WIDTH"
  // Adding "id" Attribute using the position of the CELL "`${y}-${x}`"
  // IS running the code using the HEIGHT and WIDTH
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
  htmlBoard.style.setProperty('--Height', "-" + htmlBoard.offsetHeight + "px");
}

/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
  // TODO: write the real version of this, rather than always returning 0
  for (let y = HEIGHT - 1; y >= 0; y--) {
    if (!board[y][x]) {
      //console.log(y + " : " + x);
      return y;
    }
  }
  return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  // TODO: make a div and insert into correct table cell
  const piece = document.createElement('div');
  piece.classList.add(`${currPlayer}`)
  const spot = document.getElementById(`${y}-${x}`);
  if (!board[y][x]) {
    board[y][x] = currPlayer;
    spot.append(piece);
  }
}

/** endGame: announce game end */

function endGame(msg) {
  // TODO: pop up alert message
  alert(msg);
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  // get x from ID of clicked cell
  const x = +evt.target.id;
  //console.log(x);

  // get next spot in column (if none, ignore click)
  let y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place piece in board and add to HTML table
  // TODO: add line to update in-memory board
  placeInTable(y, x);

  //check for win
  if (checkForWin()) {
    return endGame(`Player ${currPlayer} won!`);
  }

  // check for tie
  // TODO: check if all cells in board are filled; if so call, call endGame
  checkTie();

  // switch players
  // TODO: switch currPlayer 1 <-> 2
  currPlayer === 'blue' ? currPlayer = 'red' : currPlayer = 'blue';

}

function checkTie() {
  if (board.every((row) => {
    return row.every((cell) => cell)
  })) {
    return endGame('Game is Tie!');
  }
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer


    /*
        return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );*/

    // Here is the Magic, check that every cells is === currPlayer
    // If return flase is not a winner
    // cells is the 4 way of winning condition horiz, vert, diagDR, diagDL    
    // do this every time that the player click to insert a dot
    // Running all the double array [][]

    //horiz vert, diagDR, diagDL they are array with 4 value 
    //horiz
    // - - - -
    //vert 
    // |
    // |
    // |
    // |
    //diagDR
    //    /
    //   /
    //  /
    // /
    //diagDL
    // \
    //  \
    //   \
    //    \

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }
  // TODO: read and understand this code. Add comments to help you.  
  // This return a array with the 4 value that are going to be check for winner  
  // horiz vert, diagDR, diagDL 
  // Pass the Array to the _win() in order to check for the winner
  // This is run all the board checking for winning situation
  
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {

      let horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      let vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      let diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      let diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
      
      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

makeBoard();
makeHtmlBoard();
