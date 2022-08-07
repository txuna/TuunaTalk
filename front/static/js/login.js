//https://socket.io/get-started/private-messaging-part-2/

const username = document.querySelector("#username")
const join_btn = document.querySelector(".submit button")

function init(){
    join_btn.addEventListener("click", confirm_username)
    username.addEventListener("keypress", (event) => {
        if(event.key === "Enter"){
            event.preventDefault() 
            confirm_username()
        }
    })
}

function confirm_username(){
    if(!username.value){
        alert("Invalid username!")
        return; 
    }
    login()
    username.value = ""
}

async function login(){
    const response = await fetch('/api/login', {
        method: 'POST', 
        headers : {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'username' : username.value
        })
    })
    /*
        서버측에서 응답을 기다리고 사용가능한 username이라면 redirect -> /
    */
    const data = await response.json()

    if(data['status'] == 200){
        window.location.href = '/'
    }
    
}

init()