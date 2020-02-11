var rest = require("swanrest")

//Connect to database (only need to call once)
rest.dbSetup("localhost", "resttest", "", "resttest")

rest("/", ()=>{
    return rest.dbQuery("SELECT * FROM ??;", "people")
    .then(v=>v[0].name)
})

rest("/insert", ()=>{
    return rest.dbQuery("INSERT INTO people(name,job) VALUES (?,?)", "Niska", "Psycho")
})

rest("/implicit", ()=>"-sql:SELECT * FROM people")

rest.start()