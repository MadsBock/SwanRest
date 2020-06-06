var rest = require("../SwanRest")

rest("/", ()=>{throw "test error"})

rest.reportErrors = true

rest.start(8080)