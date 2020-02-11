var rest = require("swanrest")

rest("/", (q)=>{
    return "The parameter is " + q.text
})

rest.start()