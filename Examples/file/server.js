var rest = require("swanrest")

rest("/", ()=>{
    return "-file:index.html"
})

rest.start()