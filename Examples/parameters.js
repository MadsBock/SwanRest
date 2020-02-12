var rest = require("../SwanRest")

rest("/", (q)=>{
    return "The parameter is " + q.text
})

rest.start()