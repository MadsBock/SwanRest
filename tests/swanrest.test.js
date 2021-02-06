const rest = require("../SwanRest")
const get = (relativePath) => require("node-fetch")(`http://localhost:8080${relativePath}`)
const post = (relativePath) => require("node-fetch")(`http://localhost:8080${relativePath}`, {method:"POST"})

beforeAll(()=>{
    rest.start()
})

test("Can make simple request", done=>{
    rest("/a", ()=>"foo")

    get("/a")
    .then(res=>res.text())
    .then(text=>{
        expect(text).toBe("foo")
    })
    .then(done)
    .catch(err=>done(err))    
})

test("Can make simple request, specifically get", done=>{
    rest.get("/b", ()=>"bar")

    get("/b")
    .then(res=>res.text())
    .then(text=>{
        expect(text).toBe("bar")
    })
    .then(done)
    .catch(err=>done(err))    
})

test("Can make simple request, specifically post", done=>{
    rest.post("/c", ()=>"foo")

    post("/c")
    .then(res=>res.text())
    .then(text=>{
        expect(text).toBe("foo")
    })
    .then(done)
    .catch(err=>done(err))    
})

test("Will fail if the wrong method is used for request", done=>{
    rest.post("/d", ()=>"foo")

    get("/d")
    .then(res=>{
        expect(res.status).toBe(404)
        return res.text()
    })
    .then(text=>{
        expect(text).not.toBe("foo")
    })
    .then(done)
    .catch(err=>done(err)) 
})

test("Will give 403 if you try to access a page outside of domain", done=>{
    rest.domain.add("eTest")
    rest.eTest.get("/e", ()=>"foo")

    get("/e")
    .then(res=>{
        expect(res.status).toBe(403)
        return res.text()
    })
    .then(text=>{
        expect(text).not.toBe("foo")
    })
    .then(done)
    .catch(err=>done(err)) 
})

afterAll(()=>{
    rest.stop()
})