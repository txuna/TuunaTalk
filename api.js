const router = require('express').Router(); 

/*
    해당 username으로 로그인된 사용자가 있는지 확인 -> 비밀번호도 없는 관계로 확인 X? 
    -> 아니면 socket.io로 연결된 username으로 체크? 

    만약 사용가능한 username이라면 session 생성후 status 코드 작성 
    클라이언트 측에서는 해당 값을 기반으로 page redirection 
*/
router.post('/login', (req, res) => {
    if(req.session.user){ 
        res.send({
            'status' : 200, 
            'msg' : 'Successfully login'
        })
    }else{
        //console.log(req.body['username'])
        req.session.user = req.body['username'] //session 생성 (미들웨어로 작동)
        res.send({
            'status' : 200, 
            'msg' : 'Already Login'
        })
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy()
    res.send({
        'status' : 200, 
        'msg' : 'Successfully logout'
    })
})

module.exports = router 