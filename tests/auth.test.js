const rest = require("../SwanRest")
var node_fetch = require("node-fetch")
var fetch = path => node_fetch(`http://localhost:8081${path}`)

beforeAll(()=>{
    rest.start(8081)
})

test("A user dont automatically have access to a new domain", done=>{
    const mock = jest.fn()
    const domain = rest.createDomain("a")
    domain.get("/a", mock)

    fetch("/a")
    .then(res=>{
        expect(res.status).toBe(403)
        expect(mock).not.toHaveBeenCalled()
        done()
    })
    .catch(done)
})

test("A user can be granted access to a domain", done=>{
    const grant = jest.fn((q,sess)=>{
        sess.grantAccess("b")
    })
    const use = jest.fn()
    const domain = rest.createDomain("b")
    rest.get("/b/grant", grant)
    domain.get("/b/use", use)

    fetch("/b/use")
    .then(res=>{
        expect(res.status).toBe(403)
        expect(use).not.toHaveBeenCalled()
        return fetch("/b/grant")
    })
    .then(res=>{
        expect(res.status).toBe(200)
        expect(grant).toHaveBeenCalled()
        return fetch("/b/use")
    })
    .then(res=>{
        expect(res.status).toBe(200)
        expect(use).toHaveBeenCalled()
    })
    .then(()=>done())
    .catch(done)
})

afterAll(()=>{
    rest.close()
})