const imgUrl = document.querySelector('#img-url');
const topText = document.querySelector('#top-text');
const botText = document.querySelector('#bot-text');
const btnSubmit = document.querySelector('#submit');
const memesHolder = document.querySelector('.memes-holder');
const valid = document.querySelector('.valid');

btnSubmit.addEventListener('click', function (e) {
    e.preventDefault();
    if (!isValidHttpUrl(imgUrl.value)) {
        valid.removeAttribute('hidden');
    } else {
        valid.setAttribute('hidden', true);
        const newDivHolder = document.createElement('div');
        newDivHolder.classList.add('meme');
        const newDivTopTextMeme = document.createElement('div');
        newDivTopTextMeme.classList.add('top-text-meme');
        let xtopText = document.createElement('h2');
        if (topText.value) {
            xtopText.innerText = topText.value;
        }
        const imgHolder = document.createElement('div');
        imgHolder.classList.add('img-holder');
        const img = document.createElement('img');
        img.setAttribute('src', imgUrl.value);
        img.setAttribute('alt', 'Img Not Found');
        const newBotTextMeme = document.createElement('div');
        newBotTextMeme.classList.add('but-text-meme');
        let xbotText = document.createElement('h2');
        if (botText.value) {
            xbotText.innerText = botText.value;
        }
        newDivTopTextMeme.append(xtopText);
        imgHolder.append(img);
        newBotTextMeme.append(xbotText);
        newDivHolder.append(xtopText);
        newDivHolder.append(img);
        newDivHolder.append(xbotText);
        memesHolder.prepend(newDivHolder);

        newDivHolder.addEventListener('click', function () {
            newDivHolder.remove();
        });
    }
});

function isValidHttpUrl(string) {
    let url;
    
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
  }