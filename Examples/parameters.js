var rest = require("../SwanRest")

rest("/", (q)=>{
    return "The parameter is " + q.text
})

rest("/", (q)=>{
    return "The parameters are " + JSON.stringify(q)
}, "POST")

rest("/expected", (q)=>{
    return "The parameters are " + JSON.stringify(q)
}, "GET", ["foo", "bar"])

rest.start()