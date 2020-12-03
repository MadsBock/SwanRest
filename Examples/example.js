const rest = require("../SwanRest")
const domain = rest.createDomain("domain")

rest.get("/grant", (q, sess)=>{
    sess.grantAccess("domain")
    return "Access Granted"
})

domain.get("/use", ()=>{
    return "Auth Works"
})

rest.start(8080)