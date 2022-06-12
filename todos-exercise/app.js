const listContainer = document.querySelector('.order-list');
const formAddTodo = document.querySelector('.add-todo');

try {
    //JSON can do a erros if list is empty
    const loadList = JSON.parse(localStorage.lists);

    function loadLocalStore() {

        // loadList.forEach(oldTask => {
        //     const newDiv = document.createElement('div');
        //     const newP = document.createElement('p');
        //     newP.innerText = oldTask.tast;
        //     const newSpan = document.createElement('span');
        //     newSpan.classList.add('material-symbols-outlined', 'icon-center');
        //     newSpan.innerText = 'restore_from_trash';
        //     newDiv.append(newP);
        //     newDiv.append(newSpan);
        //     //item-list
        //     const newLi = document.createElement('li');
        //     if (oldTask.done) {
        //         newLi.classList.add('scratch');
        //     }
        //     newLi.append(newDiv);
        //     newLi.classList.add('item-list');
        //     listContainer.prepend(newLi);
        // });

        //HAD TO RUN THE LIST BACKWARD THAT WAY IT WILL KEEP THE SAME ORDER FRON THE LOCALSTORE

        for (let i = loadList.length - 1; i >= 0; i--) {
            const newDiv = document.createElement('div');
            const newP = document.createElement('p');
            newP.innerText = loadList[i].tast;
            const newSpan = document.createElement('span');
            newSpan.classList.add('material-symbols-outlined', 'icon-center');
            newSpan.innerText = 'restore_from_trash';
            newDiv.append(newP);
            newDiv.append(newSpan);
            //item-list
            const newLi = document.createElement('li');
            if (loadList[i].done) {
                newLi.classList.add('scratch');
            }
            newLi.append(newDiv);
            newLi.classList.add('item-list');
            listContainer.prepend(newLi);
        }
    }

    loadLocalStore();

    const checking = document.querySelector('.order-list');
    const addSome2 = document.querySelector('.alert2');

    if (checking.children.length >= 1) {
        addSome2.setAttribute('hidden', true);

    } else {
        addSome2.removeAttribute('hidden');
    }

} catch (error) {
    console.log(error);
}



//WAS TRYING TO MAKE THAT WHEN THE CUSTOMER SCRATCH A TAST GO TO THE END OF THE LIST
//GOT PROBLEM AT THE TIME OF GETTING THE LIST FROM THE LOCAL STORE WAS CHANGING THE ORDER
//OF THE LIST ON THE USER SIDE

listContainer.addEventListener('click', function (e) {
    if (e.target.tagName === 'DIV') {
        const listItem = e.target.parentElement;
        if (!e.target.parentElement.classList.contains('scratch')) {
            e.target.parentElement.classList.toggle('scratch');
            //e.target.parentElement.remove();
            //listContainer.append(listItem);
            saveToLocalStore();
        } else {
            e.target.parentElement.classList.toggle('scratch');
            // e.target.parentElement.remove();
            //listContainer.prepend(listItem);
            saveToLocalStore();
        }
    }

    if (e.target.tagName === 'P') {
        const listItem = e.target.parentElement.parentElement;
        if (!e.target.parentElement.parentElement.classList.contains('scratch')) {
            e.target.parentElement.parentElement.classList.toggle('scratch');
            //e.target.parentElement.parentElement.remove();
            // listContainer.append(listItem);
            saveToLocalStore();
        } else {
            e.target.parentElement.parentElement.classList.toggle('scratch');
            //e.target.parentElement.parentElement.remove();
            // listContainer.prepend(listItem);
            saveToLocalStore();
        }
    }

    if (e.target.tagName === 'SPAN') {
        e.target.parentElement.parentElement.remove();
        saveToLocalStore();
    }
});

const tast = document.querySelector('.new-item');
const newAlert = document.querySelector('.alert');
const newItem = document.querySelector('.new-item');

//newAlert.setAttribute('hidden', true);

formAddTodo.addEventListener('click', function (e) {

    if (e.target.tagName === 'SPAN') {
        if (!(tast.value === '')) {
            const newTodo = document.querySelector('.new-item');
            const newDiv = document.createElement('div');
            const newP = document.createElement('p');
            newP.innerText = newTodo.value;
            const newSpan = document.createElement('span');
            newSpan.classList.add('material-symbols-outlined', 'icon-center');
            newSpan.innerText = 'restore_from_trash';
            newDiv.append(newP);
            newDiv.append(newSpan);
            //item-list
            const newLi = document.createElement('li');
            newLi.append(newDiv);
            newLi.classList.add('item-list');
            listContainer.prepend(newLi);
            newTodo.value = '';
            saveToLocalStore();
        } else {
            newAlert.removeAttribute('hidden');
            setTimeout(() => {
                newAlert.setAttribute('hidden', true);
            }, 3000);
        }
    }
});

newItem.addEventListener('keypress', function (e) {
    newAlert.setAttribute('hidden', true);
    e.preventDefault();
    if (e.key === 'Enter') {
        const newTodo = document.querySelector('.new-item');
        const newDiv = document.createElement('div');
        const newP = document.createElement('p');
        if (newTodo.value === '') {
            newAlert.removeAttribute('hidden');
            setTimeout(() => {
                newAlert.setAttribute('hidden', true);
            }, 3000);
            return '';
        }
        newP.innerText = newTodo.value;
        const newSpan = document.createElement('span');
        newSpan.classList.add('material-symbols-outlined', 'icon-center');
        newSpan.innerText = 'restore_from_trash';
        newDiv.append(newP);
        newDiv.append(newSpan);
        //item-list
        const newLi = document.createElement('li');
        newLi.append(newDiv);
        newLi.classList.add('item-list');
        listContainer.prepend(newLi);
        newTodo.value = '';
        saveToLocalStore();
    } else {
        newItem.value += e.key;
    }
});

const listTast = document.querySelector('.order-list');


function saveToLocalStore() {

    let storeAll = [];
    const addSome = document.querySelector('.alert2');
    if (listTast.children.length >= 1) {
        addSome.setAttribute('hidden', true);
    } else {
        addSome.removeAttribute('hidden');
    }

    if (listTast.children.length !== 0) {
        for (const li of listTast.children) {
            let currenttask = li.children[0].firstChild.innerText;
            let isscratch = li.classList.contains('scratch');

            let fullTast = { tast: currenttask, done: isscratch };
            storeAll.push(fullTast);
            localStorage.setItem('lists', JSON.stringify(storeAll));
        }
    } else {
        localStorage.removeItem('lists');
    }
}