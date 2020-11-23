const rest = require("../SwanRest")

rest.get("/", (q, sess)=>{
    sess.number = (sess.number||0)+1
    return sess.number
}, [])

rest.start(8080)