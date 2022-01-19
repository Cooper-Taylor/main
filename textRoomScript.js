//Used to check validity of username
var usedNames = ["no","nerd"];

function usernameCheck(){
    document.getElementById("usernameError").style.visibility = "hidden";

    var username = document.getElementById("usernameInput").value;
    if (username.length <= 2 || username.includes(" ") || username.includes(".")){
        document.getElementById("usernameError").style.visibility = "visible";
        document.getElementById("usernameError").innerHTML = "Not a Valid Username!";
    }else for(let name of usedNames){
        if (name === username){
            document.getElementById("usernameError").style.visibility = "visible";
            document.getElementById("usernameError").innerHTML = "Username Taken";
        }
    }

    if (document.getElementById("usernameError").style.visibility !== "visible"){
        usedNames.push(username);
        document.getElementById("usernameInput").value = "";
        console.log(usedNames);
    }

}

//Changes certain settings to make the site darker

var isDark = false

function changeToDark(){
    if(!isDark){
        document.getElementById("usernameInputScreen").style.background = "#4B4A4A";
        document.body.style.color = "#cacaca";
        document.getElementById("usernameSubmit").style.background = "#302F2F";
        isDark = true;
    }
    else{
        document.getElementById("usernameInputScreen").style.background = "white";
        document.body.style.color = "black";
        document.getElementById("usernameSubmit").style.background = "lightgray;";
        isDark = false;
    }
}


//Changes the screen
function changeScreen(screenChosen){
    let screens = ['usernameInputScreen','chatScreen'];
    for (let screen of screens){
        document.getElementById(screen).style.visibility = "hidden";
    }
    document.getElementById(screenChosen).style.visibility = "visible";
}