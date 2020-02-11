var rest = require("swanrest")

rest("/",()=>{
    return "Hello World"
})

rest("/universe",()=>{
    return "Hello Universe"
})

rest.start()