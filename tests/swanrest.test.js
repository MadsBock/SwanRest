const rest = require("../SwanRest")
const fetch = (relativePath) => require("node-fetch")(`http://localhost:8080${relativePath}`)

beforeAll(()=>{
    rest.start()
})

test("Can make simple request", done=>{
    rest("/a", ()=>"foo")

    fetch("/a")
    .then(res=>res.text())
    .then(text=>{
        expect(text).toBe("foo")
    })
    .then(done)
    .catch(err=>done(err))    
})

test("Can make simple request, specifically get", done=>{
    rest.get("/b", ()=>"bar")

    fetch("/b")
    .then(res=>res.text())
    .then(text=>{
        expect(text).toBe("bar")
    })
    .then(done)
    .catch(err=>done(err))    
})

afterAll(()=>{
    rest.stop()
})