const imgUrl = [
  "img/dog.png",
  "img/pork.png",
  "img/bee.png",
  "img/rex.png",
  "img/rat.png",
];
let category = [
  ["Animals", 21],
  ["3 Letter Words", 105],
  ["Sport", 42],
  ["Science", 25],
  ["Food", 49],
  ["People", 442],
];
//['American History', 780] ['People', 442]
let onBoard = [];
let chosenOne = [];
let currentValue = 0;
let question = "";
let answer = "";

//New Game Button to Star The Game
$(".btn-new-game").on("click", async function (e) {
  if ($(".input-2").val()) {
    e.preventDefault();
    // category = [];
    // await loadCategory();
    createTeam();
    createGame();
  }
});

async function loadCategory() {
  try {
    let res = await axios.get(`https://jservice.io/api/categories?count=100`);
    for (let i = 0; i < 5; i++) {
      let temp = res.data.sort(() => Math.random() - 0.5).pop();
      category.push([`${temp.title}`, temp.id]);
    }
  } catch (error) {
    category = [
      ["Animals", 21],
      ["3 Letter Words", 105],
      ["Sport", 42],
      ["Science", 25],
      ["Food", 49],
      ["People", 442],
    ];
  }
}

//Load The Game With the Current Question, Answer, CurrentValue
$(".game-board").on("click", ".card", function (e) {
  try {
    let clueId = undefined;
    if ($(e.target).hasClass("card")) {
      clueId = e.target.id;
    } else {
      clueId = $(e.target).parents(".card").attr("id");
    }
    if (clueId) {
      const clue = chosenOne.find((ele) => ele.id == clueId);
      currentValue = clue.value;
      question = clue.question;
      answer = clue.answer;
      $(".question").text(question);
      $("#myModal").modal("toggle");
      if ($(e.target).hasClass("card")) {
        $(e.target).prop("disabled", true);
        $(e.target).addClass("card-done");
      } else {
        $(e.target).parents(".card").prop("disabled", true);
        $(e.target).parents(".card").addClass("card-done");
      }
    }
  } catch (error) {}
});

//Event when the Modal Hide
$("#myModal").on("hidden.bs.modal", function (e) {
  $(".answer").text(answer);
  $("#myModal2").modal("toggle");
});

//Event to add Point to the Team
$(".teams").on("click", ".btn-add", function (e) {
  const id = $(e.target).parent().children()[1].id;
  const teamPoint = $(`#${id}`);
  teamPoint.text(parseInt(teamPoint.text()) + currentValue);
});

//Event to remove Point to the Team
$(".teams").on("click", ".btn-take", function (e) {
  const id = $(e.target).parent().children()[1].id;
  const teamPoint = $(`#${id}`);
  teamPoint.text(parseInt(teamPoint.text()) - currentValue);
});

// Create the team that will participate in the game
function createTeam() {
  const team = $(".input-2").val();
  $(".input-2").val("");
  const $teams = $(".teams");
  $teams.empty();
  for (let i = 0; i < team; i++) {
    let $item = $(`
            <div  class="team">
                <div class="point">
                    <button class="btn btn-add btn-sm" type="submit">✔</button>
                    <h5 id="${i}" class="point"> 0 </h5>
                    <button class="btn btn-take btn-sm" type="submit">✘</button>                
                </div>
                <img src="${imgUrl[i]}">
            </div>
        `);
    $teams.append($item);
  }
}

// Create the Game Board
async function createGame() {
  try {
    const $gameBoard = $(".game-board");
    $gameBoard.empty();
    for (let i = 0; i < category.length; i++) {
      let res = await axios.get(
        `https://jservice.io/api/category?id=${category[i][1]}`
      );
      onBoard.push(res);
      let $colum = $(`
                <div id="${res.data.id}" class="colum-holder">
                    <h4 id="${res.data.id}">${res.data.title.toUpperCase()}</h4>
                </div>`);
      $gameBoard.append($colum);
    }
    populateCard();
  } catch (error) {}
}

// Create the Card and adding this method to Create Game
function populateCard() {
  onBoard = onBoard.slice(0, 5);
  let value = 100;
  for (let j = 0; j < category.length; j++) {
    const $columHolder = $(`#${category[j][1]}`);
    for (let i = 0; i < 5; i++) {
      let index =
        onBoard[i].data.clues[
          Math.floor(Math.random() * onBoard[i].data.clues.length)
        ];
      if (index.value) {
        value = index.value;
      }
      let $item = $(
        `<div id="${index.id}" class="card"> <h3>${value}</h3> </div>`
      );
      $columHolder.append($item);
      chosenOne.push({
        id: index.id,
        question: index.question,
        answer: index.answer,
        value: value,
      });
    }
  }
}
