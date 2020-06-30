var rest = require("../SwanRest")

//Connect to database (only need to call once)
rest.mysql.setup("localhost", "swanrest", "", "swanrest")

rest("/", ()=>{
    return rest.mysql.query("SELECT * FROM ??;", "people")
})

rest("/implicit", ()=>{
    return "-sql:SELECT * FROM people LIMIT 3";
})

rest.start()