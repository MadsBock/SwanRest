var rest = require("../SwanRest")

rest("/", ()=>{
    return "-file:index.html"
})

rest.start()