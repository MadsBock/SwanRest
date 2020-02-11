var rest = require("swanrest")

rest.cookies = true

rest("/startSession", (q,session)=>{
    session.login = "JohnCena"
    return "Started"
})

rest("/useSession", (q, session)=>{
    if(session.login == "JohnCena") {
        return "Works"
    } else {
        return "Doesnt"
    }
})

rest.start()