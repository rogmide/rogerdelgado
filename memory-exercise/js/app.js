const gameContainer = document.querySelector('.game-container');
const newGame = document.querySelector('.btn-new-game');
const resetGame = document.querySelector('.btn-winner');
let orderList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const bS = document.querySelector('.best-score');
const storeScore = { currentBS: '0' };
const cS = document.querySelector('.score');

try {
    if (cS.innerText === '0') {
        bS.innerText = JSON.parse(localStorage.currentBS);
    }
} catch (error) {

}

// if (bS.innerText === '0') {
//     const fristBS = { score: '0' };
//     localStorage.setItem('currentBS', JSON.stringify(fristBS));
// } else {
//     bS.innerText = JSON.parse(localStorage.currentBS);
// }


newGame.addEventListener('click', function (e) {
    location.reload();
});

resetGame.addEventListener('click', function (e) {
    location.reload();
});

let match1 = '';
let match2 = '';
let count = 0;
let score = 0;
let attent = 0;

randomPosition();

const scoreShow = document.querySelector('.score');

function randomRGB() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b} )`;
}

const letters = document.querySelectorAll('.letter');
const winner = document.querySelector('.style-winner');
const btnWinner = document.querySelector('.btn-winner');

const interId = setInterval(() => {
    for (const letter of letters) {
        letter.style.color = randomRGB();
    }
}, 1000);

gameContainer.addEventListener('click', function (e) {

    if (!(e.target.classList.contains('stay'))) {

        e.target.classList.add('stay');
        e.target.classList.add('up');

        firstCard();
        secondCard();
        checkMatch();

        if (count == 6) {
            winner.removeAttribute('hidden');
            btnWinner.removeAttribute('hidden');
            scoreShow.innerText = Math.round((score - (attent - 12)));

            try {
                storeScore = localStorage.currentBS;
            } catch (error) {
                //storeScore = { currentBS: '0' };
            }

            let currentScore = Math.round((score - (attent - 12)));

            if (parseInt(bS.innerText) < parseInt(cS.innerText)) {
                bS.innerText = cS.innerText;
                localStorage.setItem('currentBS', currentScore);
            }

            //console.log((attent - 12) / 2);
        }
    }
});

const bestScore = { bScore: '' }


function firstCard() {
    for (const up of gameContainer.children) {
        if (up.children[0].classList.contains('up')) {
            if (match1 === '') {
                match1 = up.children[0].id; match1
                up.children[0].classList.remove('up');
                return match1;
            }
        }
    }
}

function secondCard() {
    if (!(match1 === '')) {
        for (const up of gameContainer.children) {
            if (up.children[0].classList.contains('up')) {
                if (match2 === '') {
                    match2 = up.children[0].id;
                    up.children[0].classList.remove('up');
                    return match2;
                }
            }
        }
    }
}

function checkMatch(e) {
    attent++;
    if (match1 !== '' && match2 !== '') {
        if (match1 === match2) {
            match1 = '';
            match2 = '';
            score += 5;
            scoreShow.innerText = Math.round((score - (attent - 12)));
            count++;
        } else {
            for (const up of gameContainer.children) {
                if (up.children[0].id === match1) {
                    setTimeout(() => {
                        up.children[0].classList.remove('stay');
                    }, 500);

                }
                if (up.children[0].id === match2) {
                    setTimeout(() => {
                        up.children[0].classList.remove('stay');
                    }, 500);
                }
            }
            match1 = '';
            match2 = '';
        }
    }
}


function randomPosition() {

    let unOrder = shuffledArr(orderList);

    for (let i = 0; i < 11; i++) {
        gameContainer.children[i].id = 'i' + unOrder[i];
        //console.log(gameContainer.children[i]);
    }
}

function shuffledArr(orderList) {
    return orderList.sort(function () {
        return 0.5 - Math.random();
    });
}

