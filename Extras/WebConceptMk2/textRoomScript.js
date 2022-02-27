//Used to check validity of username
var usedNames = [];

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

//Repurposed from main/Extras/Sharp/game.js
//Check if the user has dark mode on and adjust if so (From Flavicopes https://flaviocopes.com/javascript-detect-dark-mode/)
if (window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //dark mode
    document.getElementById("usernameInputScreen").style.background = "#4B4A4A";
    document.body.style.color = "#cacaca";
    document.getElementById("usernameSubmit").style.background = "#302F2F";
    console.log("dark mode it is");
} else {
    //light mode
    document.getElementById("usernameInputScreen").style.background = "white";
    document.body.style.color = "black";
    document.getElementById("usernameSubmit").style.background = "lightgray;";
    console.log("light mode it is");
}

//Checks if the user changes color modes and adjusts
window.matchMedia('(prefers-color-scheme: dark)')
.addEventListener('change', (event) => {
if (event.matches) {
    //dark mode
    document.getElementById("usernameInputScreen").style.background = "#4B4A4A";
    document.body.style.color = "#cacaca";
    document.getElementById("usernameSubmit").style.background = "#302F2F";
    console.log("dark mode it is");
} else {
    //light mode
    document.getElementById("usernameInputScreen").style.background = "white";
    document.body.style.color = "black";
    document.getElementById("usernameSubmit").style.background = "lightgray;";
    console.log("light mode it is");
}
});

//Changes the screen
function changeScreen(screenChosen){
    let screens = ['usernameInputScreen','mainScreen'];
    for (let screen of screens){
        document.getElementById(screen).style.visibility = "hidden";
    }
    document.getElementById(screenChosen).style.visibility = "visible";
}