var rest = require("../SwanRest")

//Connect to database (only need to call once)
rest.dbSetup("localhost", "swanrest", "", "swanrest")

rest("/", ()=>{
    return rest.dbQuery("SELECT * FROM ??;", "people")
})

rest.start()