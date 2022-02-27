//Same object as on the server
const socket = io();

let chatForm = document.getElementById("chatForm"); //get chat box form element
let chatInput = document.getElementById("chatInput"); //get chat box input element
let chatMessagesDiv = document.getElementById("chatMessagesDiv"); //get chat div element, needed for scrolling
let chatMessages = document.getElementById("chatMessages"); //ul element used for appending text to the chat

//add submit event listener so a message is sent to server when ever a message is entered
chatForm.addEventListener('submit', function(e){
    e.preventDefault();
    if(chatInput.value){
      socket.emit("message", chatInput.value);
      chatInput.value = '';
    }
} );

//for adding text to chat
function addTextToChat(text){
    let item = document.createElement('li');

    if(text.state === "error"){
      item.style.backgroundColor = "red";
      item.textContent = text.data;
    }else if(text.state === "success"){
      item.style.backgroundColor = "seagreen";
      item.textContent = text.data;
    }else if(text.state === "update"){
      item.style.backgroundColor = "LightSlateGray";
      item.innerText = text.data;
    }else if(text.state === "rainbow"){

      let colorTrack = 0; //Makes sure that the rainbow descends and is not messed up with spaces
      for(let n = 0; n < text.data.length; n++){
       
        let span = document.createElement("span");

        if(n > text.data.search(":") && text.data[n] !== " "){
            switch(colorTrack % 6){
            case 0:
              span.style.color = "#FF0900";
            break;
            case 1:
              span.style.color = "#FF7F00";
            break;
            case 2:
              span.style.color = "#FFEF00";
            break;
            case 3:
              span.style.color = "#00F11D";
            break;
            case 4:
              span.style.color = "#0079FF";
            break;
            case 5:
              span.style.color = "#A800FF";
            break;

          }
            colorTrack++;
        }
        
        span.textContent = text.data[n];

        item.appendChild(span);
      }

    }else{
      item.textContent = text.data;
    }         

    chatMessages.appendChild(item);
    chatMessagesDiv.scrollTo(0, chatMessagesDiv.scrollHeight);
}

socket.on('connect', ()=>{
    console.log(socket.id);
})

//for catching the client up on chat history when just joining in
socket.on("chatUpdate", (chatHistory)=>{
    let x;
    for(x  = 0; x < chatHistory.length; x++)
    {
        addTextToChat(chatHistory[x]);
    }
});

//whenever server sends message to client client will change ui to show this message
socket.on("message", function(text){
    addTextToChat(text);
} );

//for when the server sends you error messages
socket.on("error", (txt)=>{
    alert(String(txt));
});
