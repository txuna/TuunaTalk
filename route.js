const router = require('express').Router(); 
const path = require('path')

router.get('/join', (req, res) => {
    if(req.session.user){
        res.redirect('/')
    }
	else{
        res.sendFile(path.join(__dirname, '/front/public/login.html'))
    }
})
//var userID = socket.handshake.session.user 이런식으로 socket.io에서 session에 접근?
// 세션 체크
router.get('/', (req, res) => {
    if(!req.session.user){
        res.redirect('/join')
    }
	else{
        res.sendFile(path.join(__dirname + "/front/public/room.html"))
    }
})

module.exports = router 