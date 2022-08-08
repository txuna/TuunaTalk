const express = require('express')
const app = express() 
const http = require('http')
// socket io 서버 생성
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {
	cors: {
		origin: "*", // should be setup
		methods : ["GET", "POST"], 
		transports: ["websocket", "polling"], 
		credentials: true
	}, 
	allowEIO3: true
}); 

// 세선 생성
const session = require('express-session')
const MemoryStore = require('memorystore')(session)

//라우팅
const pageRoute = require('./route') //page route 
const apiRoute = require('./api')(app, io)    //api route
const testRoute = require('./test')(app, io)

const sessionMiddleware = session({
	secret: 'secret key', // should be setup
	resave: false, 
	saveUninitialized: true, 
	store: new MemoryStore({checkPeriod: 1000 * 60 * 5}),
	cookie: {
		maxAge: 1000 * 60 * 5
	}
})


function init(){
	app.use(express.json())
	app.use(sessionMiddleware)
	app.use('/', pageRoute)
	app.use('/api', apiRoute)
	app.use('/test', testRoute) // test router
	app.use(express.static('front/public'))
	app.use('/js', express.static('front/static/js'))
	app.use('/css', express.static('front/static/css'))
	app.use('/img', express.static('front/static/img'))

	/*  
		socket.io가 세션미들웨어를 사용할 수 있도록 설정
	*/
	const wrap = middleware => (socket, next) => middleware(socket.request, {}, next); 
	io.use(wrap(sessionMiddleware))
	io.use((socket, next) => {
		const session = socket.request.session; 
		if(session && session.user){
			next(); 
		}else{
			next(new Error("unAuthorized"))
		}
	})

	/*
		@TODO
		같은 세션을 공유하고 있으면 같은 대화방으로 인식하게 해야함
		웹 세션이 끊어지면 socket도 연결 종료 
		새로고침해도 메시지 내용 복구 가능하게

		만약 새로운 connection이 기존 유저라면 new user emit 패스 
	*/
	io.on('connection', (socket) => {
		//console.log(`new socket : ${socket.id}`)
		// 유저가 접속했을 시 접속자 명단 sender 제외하고 전송
		console.log(`new user connected ${socket.request.session.user}`)
		io.emit('user connected', `new user(${socket.request.session.user}) connected!`)
		// 클라이언트로 부터 온 메시지를 연결된 클라이언트에게 전송 
		// sender를 제외하고는 other type으로 전송 
		// sender에게는 me type으로 전송
		// 해당 유저가 세션이 만료된 유저인지도 확인하기
		socket.on('chat message', (msg) => {
			let sender = socket.request.session.user
			let now = get_current_time()
			console.log(`[${now}] sender : ${socket.request.session.user} msg : ${msg}`)
			let other_packet = msg_packet(sender, 'other', msg, now, 200) 
			let me_packet = msg_packet(sender, 'me', msg, now, 200)

			// sender를 제외한 클라이언트에게 전송 
			socket.broadcast.emit("chat message", other_packet)
			// sender에게 전송
			socket.emit('chat message', me_packet)
		}); 

		socket.on('disconnect', () => {
			console.log(`user disconnected ${socket.request.session.user}`)
			// 유저의 접속이 끊어졌을 시 sender를 제외하고 모두 전송
			socket.broadcast.emit('user disconnected', `user(${socket.request.session.user}) disconnected!`)
		})
	})
}


/*
	해당 socket이 새로고침했을 때 새로운 유저로 인식하지 못하게 해야함 
*/
function new_socket_user(socket){

}


// msg packet를 생성한다. type 신경
function msg_packet(sender, type, msg, time, status){
	let packet = {
		'status' : status,
		'sender' : sender, 
		'type' : type, 
		'msg' : msg, 
		'time' : time
	}
	return packet
}

// 현재 시간 알림
function get_current_time(){
	let currentdate = new Date(); 
	let datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
				+ currentdate.getSeconds();
				
	return datetime
}


init()

server.listen(5003, () => {
	console.log('listening on *:5003')
})