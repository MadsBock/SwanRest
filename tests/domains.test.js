var rest = require("../SwanRest")

test("Adding a domain will make it available to the user", ()=>{
    expect(rest.domains.a).toBeUndefined()
    var newDomain = rest.addDomain("a")
    expect(rest.domains.a).toBeDefined()
    expect(rest.domains.a).toBe(newDomain)
})

test("An added domain has the correct functions", ()=>{
    rest.addDomain("b")
    const b = rest.domains.b
    expect(b.main).toBeDefined()
    expect(b.messageReceived).toBeDefined()
    expect(b.get).toBeDefined()
    expect(b.post).toBeDefined()
    expect(b.createError).toBeDefined()
})