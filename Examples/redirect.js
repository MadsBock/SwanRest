var rest = require("../SwanRest")

rest("/", ()=>"-redirect:/redirected")

rest("/redirected", ()=>{
    return "You have been redireted!"
})

rest.start()