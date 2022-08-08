/*
    모듈내에 app, io객체 사용 하는 법 
    https://stackoverflow.com/questions/29334800/express-js-4-and-sockets-with-express-router
*/

module.exports = (app, io) => {
    const router = require('express').Router(); 
    const application = app; 
    
    router.post("/test", async (req, res) => {
        //io.emit("test", "new message")
        const sockets = await io.fetchSockets(); 

        // socket.id는 다르더라도 session.id는 같으르모 session.id 같은거 모두 connection close걸기
        for(const socket of sockets){
            if(socket.request.session.id === req.sessionID){
                socket.disconnect()
            }
        }
        res.send({
            'status' : 200
        })
    })

    return router
}