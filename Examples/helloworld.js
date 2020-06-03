var rest = require("../SwanRest")

rest("/",()=>{
    return "Hello World"
})

rest("/universe",()=>{
    return "Hello Universe"
})

//Number types will evaluate the same way strings are.
rest("/number", ()=>{
    return 15
})

rest.start()