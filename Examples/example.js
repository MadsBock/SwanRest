const rest = require("../SwanRest")

rest.get("/", ()=>"foo")

rest.start(8080)