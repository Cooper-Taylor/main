var username;

function writeEvent(text){
    const parent = document.querySelector('#chatMessages');

    const el = document.createElement('li');
    el.innerHTML = text;

    parent.appendChild(el);
}

function onFormSubmitted(event){
    event.preventDefault();

    const input = document.querySelector('#chatInput');
    const text = `${username}: \n` + input.value;
    input.value = '';

    //Sending event called message to server with text
    socket.emit('message', text);
}

//Found in "settings"
function onUserSubmit(event){
    event.preventDefault();

    username = document.querySelector('#user').value;
    localStorage.setItem('userID',username);
    socket.emit('setUserID',username);
}

function checkID(){
    socket.emit('returnedID');
}

//Same object as on the server
const socket = io();

socket.on('message', writeEvent);

socket.on('User', (clientObj) =>{
    if (localStorage.length == 0){
        username = clientObj.username;
        localStorage.setItem('userID',username);
        socket.emit('setUserID',username);
    }
    else{
        username = localStorage.getItem('userID');
        console.log(localStorage);
    }
});

socket.on('checkUsername', ()=>{
    if (localStorage.length > 0){
        socket.emit('usernameCheck',true,localStorage.getItem('userID'));
        console.log('true');
    } else{
        socket.emit('usernameCheck',false,null);
    }
})

//socket.on('checkID', checkID());

socket.on('connect', ()=>{
    console.log(socket.id);
})

document.querySelector('#chatForm').addEventListener('submit', onFormSubmitted);
//Found through settings
document.querySelector('#username-form').addEventListener('submit', onUserSubmit);

/* 
*/