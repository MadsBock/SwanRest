const rest = require("../SwanRest")
const fetch = require("fetch-cookie")(require("node-fetch"))
const get = (relativePath) => fetch(`http://localhost:8081${relativePath}`)
const post = (relativePath) => fetch(`http://localhost:8081${relativePath}`, {method:"POST"})
const delay = (ms) => new Promise(resolve=>setTimeout(resolve, ms))

beforeAll(()=>{
    rest.start(8081)
})

test("Can make simple request", done=>{
    rest("/a", ()=>"foo")

    get("/a")
    .then(res=>res.text())
    .then(text=>{
        expect(text).toBe("foo")
    })
    .then(done)
    .catch(err=>fail(err))   
})

test("Can make simple request, specifically get", done=>{
    rest.get("/b", ()=>"bar")

    get("/b")
    .then(res=>res.text())
    .then(text=>{
        expect(text).toBe("bar")
    })
    .then(done)
    .catch(err=>fail(err))  
})

test("Can make simple request, specifically post", done=>{
    rest.post("/c", ()=>"foo")

    post("/c")
    .then(res=>res.text())
    .then(text=>{
        expect(text).toBe("foo")
    })
    .then(done)
    .catch(err=>fail(err))  
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
    .catch(err=>fail(err)) 
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
    .catch(err=>fail(err)) 
})

test("Will give 200 if you are granted access", done=>{
    rest.domain.add("fTest")
    rest.fTest.get("/f", ()=>"foo")
    rest.get("/fGrant", (q,sess)=>{
        sess.grantAccess("fTest")
    })

    get("/fGrant")
    .then(data=>{
        expect(data.status == 200)
        return get("/f")
    })
    .then(data=>data.text())
    .then(text=>{
        expect(text).toBe("foo")
        done()
    })
    .catch(err=>done(err))
})

test("Will work if given a promise as a return value", done=>{
    rest.get("/g", ()=>delay(1000).then(()=>"foo"))

    get("/g").then(data=>data.text())
    .then(text=>{
        expect(text).toBe("foo")
        done()
    })
    .catch(err=>fail(err))
})

test("Will work if given an object as a return value", done=>{
    const o = {foo:"bar"}
    rest.get("/h", ()=>(o))

    get("/h").then(data=>data.text())
    .then(text=>{
        expect(text).toBe(JSON.stringify(o))
        done()
    })
    .catch(err=>{fail(err)})
    .finally(done)
})

afterAll(()=>{
    rest.stop()
})