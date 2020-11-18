var rest = require("../SwanRest")

test("start will return an object", ()=>{
    const r = rest.start(8080)
    expect(r).toMatchObject(rest)
})

afterEach(()=>{
    rest.close()
})