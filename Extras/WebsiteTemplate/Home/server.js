const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();

const clientPath = `${__dirname}`;
console.log(clientPath)

app.use(express.static(clientPath))

const server = http.createServer(app);

const io = socketio(server);

//Establishing object to keep track of usernames
var infoMap = new Map([
    ['someSocket', {username : 'Cooper'}],
]);

/*function generateID(){
    return '_' + Math.random().toString(36).substr(2, 9);
}*/

io.on('connection', (socket) =>{
    //assigns a random sessionID and username
    infoMap.set(socket.id, {username : Math.floor(Math.random()*400)});
    socket.join(infoMap.get(socket.id).username);

    //First checking if the client has a username already - if it doesn't, request username
    socket.emit('checkUsername');
    console.log(infoMap);

    //Switching name on map to name on local storage
    socket.on('usernameCheck', (bool,name) =>{
        if(bool){
            socket.leave(infoMap.get(socket.id).username);
            infoMap.get(socket.id).username = name;
            //Making the socket join the 'name' room, so you can freely message that user w/ only username
            socket.join(name);
        }
    } )

    console.log('Someone Connected');
    socket.emit('message', 'Connected.');

    //socket.emit('message',`${nameObj[socket.id].username}`);
    io.emit('User', infoMap.get(socket.id));

    //If there is not an ID in the local storage, add to the object here;
    socket.on('setUserID',(localUser) =>{
        infoMap.get(socket.id).username = localUser;
    })

    //On message, recieve text and send text to all clients
    socket.on('message', (text) =>{
        //io is the entire server
        io.emit('message', text);
    })

    //This will not delete the client-side username :)
    socket.on('disconnect',() =>{
        io.emit('message', `User ${infoMap.get(socket.id).username} has disconnected`);
        io.emit('User', infoMap.get(socket.id));
        //Will then delete the map of socketID
        infoMap.delete(socket.id);
    })
})

/*  Use later to check usernames submitted by the user!
function usernameCheck(){
    document.getElementById("usernameError").style.visibility = "hidden";

    var username = document.getElementById("usernameInput").value;
    if (username.length <= 0 || username.includes(" ") || username.includes(".")){
        document.getElementById("usernameError").style.visibility = "visible";
        document.getElementById("usernameError").innerHTML = "Not a Valid Username!";
    }else for(let name of usedNames){
        if (name === username){
            document.getElementById("usernameError").style.visibility = "visible";
            document.getElementById("usernameError").innerHTML = "Username Currently In Use";
        }
    }

    if (document.getElementById("usernameError").style.visibility !== "visible"){
        usedNames.push(username);
        document.getElementById("usernameInput").value = "";
        changeScreen('mainScreen');
        console.log(usedNames);
    }
}
*/


server.on('error', (err) =>{
    console.error('Server error', err);
})

server.listen(process.env.PORT, () =>{
    console.log('Test stared on process.env.PORT');
})