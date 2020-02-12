var rest = require("../SwanRest")

rest("/",()=>{
    return "Hello World"
})

rest("/universe",()=>{
    return "Hello Universe"
})

rest.start()