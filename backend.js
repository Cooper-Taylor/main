
//Express app :D
const express = require('express');
const app = express();
app.disable('x-powered-by'); //small security boost
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io'); //using socket io
const io = new Server(server);

//Thx!
const clientPath = __dirname;
app.use(express.static(clientPath));

//records the chat
let chatHistory = [];

//Socket io stuff
io.on('connection', (socket) =>{
    io.emit("chatUpdate", chatHistory); //sends chat history to update the new client
 
    //On message, recieve text and send text to all clients
    socket.on('message', (text) =>{
        //try catch to check for proper parameters and also that the text msg is not too long
        try
        {
            if(typeof text !== "string"){return;}

            //If text is more than 120 characters long than stop it
            if(text.length > 120){socket.emit("error", "Cannot send messages over 120 characters long"); return;}
            }
        catch(err)
        {
            return err;
        }

        //io is the entire server
        let txt = {}; //create an object so that the texts can have different statuses and stuff
        txt.data = text;
        txt.state = ""; //default txt state

        //rainbow :O
        if(txt.data.toLowerCase().trim() === "rainbow")
        {
            txt.state = "rainbow";
        }

        //check just in case the chatHistory is not too long and if so it wipes it
        if(chatHistory.length > 1000)
        {
            chatHistory = [];
        }else{
            chatHistory.push(txt); //store the message
        }

        io.emit('message', txt);
    });

    socket.on('disconnect',() =>{
       
    });
});




//make server open on port 3001 or whatever port Heroku gives (that the process.env.PORT part)
server.listen(process.env.PORT || 3001, () => {
    console.log("server listening on port 3001");
});

