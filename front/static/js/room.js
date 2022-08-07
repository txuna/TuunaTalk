const logout_btn = document.querySelector(".logout")
const messages = document.querySelector(".messages")
const send_btn = document.querySelector(".send button")
const msg_input = document.querySelector(".send input")

let socket = io('ws://158.247.217.153:5003', {transports: ['websocket', 'polling']})

function init(){
    logout_btn.addEventListener("click", () => {
        logout();
    })
    send_btn.addEventListener('click', send_msg)
    msg_input.addEventListener('keypress', (event) => {
        if(event.key === 'Enter'){
            event.preventDefault() 
            send_msg()
        }
    })

    // socket 수신 대기
    socket.on('chat message', (packet) =>{
        recv_msg(packet)
    })

    socket.on('user connected', (msg) => {
        append_system_msg("system", msg)
    })

    socket.on('user disconnected', (msg) => {
        append_system_msg("system", msg)
    })

    // err['status'] and err['msg'] -> 에러 발생시 
    socket.on('connect_error', (err) => {
        alert("disconnected from server")
    })
}


async function logout(){
    const response = await fetch('/api/logout', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json',
        },
    })

    const data = await response.json()
    // logout이 성공적으로 진행됐을 시 redirect
    if(data['status'] == 200){
        window.location.href='/join'
    }
}


// 서버로 부터 메시지를 받을 때 me인지 other인지 구별필요
function recv_msg(packet){
    //append_msg("me", "me", msg_input.value, "22.7.12 12:12:12")
    // 에러 발생
    if(packet['status'] != 200){
        return;
    }
    append_msg(packet['type'], packet['sender'], packet['msg'], packet['time'])
}


// 서버로 부터 전송
function send_msg(){
    if(msg_input.value == ""){
        alert("Can't send blank msg!")
        return
    }
    socket.emit('chat message', msg_input.value)
    msg_input.value = ""
}

/*
    type : me or other 
    username : msg's username 
    msg : msg content 
    time : msg send time
*/
function append_msg(type, username, msg, time){
    let li = document.createElement("li")
    li.classList.add(type)
    let username_span = document.createElement("span")
    let msg_span = document.createElement("span")
    let time_span = document.createElement("span")

    username_span.innerText = username 
    msg_span.innerText = msg 
    time_span.innerText = time
    
    li.appendChild(username_span)
    li.appendChild(msg_span)
    li.appendChild(time_span)

    messages.appendChild(li)
}

// system msg 
function append_system_msg(type, msg){
    let li = document.createElement("li")
    li.classList.add(type)
    let msg_span = document.createElement("span")
    msg_span.innerText = msg

    li.appendChild(msg_span)

    messages.appendChild(li)
}


init()