module.exports = (app, io) => {
    const router = require('express').Router(); 

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

    // 로그아웃을 진행하면 같은 세션으로 연결되어 있는 socket close 진행 
    // 같은 세션이라도 socket은 따로 연결하는것이기에 socket.id가 달라짐 
    router.post('/logout', async (req, res) => {
        //console.log(req.sessionID)
       
        // 연결되어 있는 모든 소켓을 가지고 옴 
        const sockets = await io.fetchSockets(); 

        // socket.id는 다르더라도 session.id는 같으르모 session.id 같은거 모두 connection close걸기
        for(const socket of sockets){
            if(socket.request.session.id === req.sessionID){
                socket.disconnect()
            }
        }
        // 세션 삭제
        req.session.destroy()
        res.send({
            'status' : 200, 
            'msg' : 'Successfully logout'
        })
    })

    return router
}