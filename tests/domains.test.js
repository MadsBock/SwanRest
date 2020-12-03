var rest = require("../SwanRest")

test("Adding a domain will make it available to the user", ()=>{
    expect(rest.domains.a).toBeUndefined()
    var newDomain = rest.createDomain("a")
    expect(rest.domains.a).toBeDefined()
    expect(rest.domains.a).toBe(newDomain)
})

test("An added domain has the correct functions", ()=>{
    rest.createDomain("b")
    const b = rest.domains.b
    expect(b.main).toBeDefined()
    expect(b.messageReceived).toBeDefined()
    expect(b.get).toBeDefined()
    expect(b.post).toBeDefined()
    expect(b.createError).toBeDefined()
})

test("can add functions to a new domain", ()=>{
    const domain = rest.createDomain("c")
    const mock = jest.fn()
    expect(()=>domain.get("/c", mock)).not.toThrow()
})