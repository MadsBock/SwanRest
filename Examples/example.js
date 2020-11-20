const rest = require("../SwanRest")

rest.get("/", ()=>"foo", ["foo", "bar"])

rest.start(8080)