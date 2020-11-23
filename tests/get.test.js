var rest = require("../SwanRest")
var node_fetch = require("node-fetch")
var fetch = path => node_fetch(`http://localhost:8080${path}`)


beforeAll(()=>{
    rest.start(8080)
})

test("a callback method is called when the server is requested", done=>{
    const mock = jest.fn()
    rest.get("/a", mock)

    fetch("/a")
    .then(()=>{
        expect(mock).toHaveBeenCalled()
        done()
    })
    .catch(err=>{
        expect(false)
        done(err)
    })
})

test("a callback method can be called multiple times", done=>{
    const mock = jest.fn()
    rest.get("/b", mock)

    var fetches = []
    for(var i = 0; i < 10; i++) {
        fetches.push(fetch("/b"))
    }
    Promise.all(fetches)
    .then(()=>{
        expect(mock).toHaveBeenCalledTimes(10)
        done()
    })
    .catch(err=>{
        expect(false)
        done(err)
    })
})

test("the output of a callback must be the one received when requested", done=>{
    const mock = jest.fn(()=>"foo")
    rest.get("/c", mock)

    fetch("/c")
    .then(()=>{
        expect(mock).toHaveBeenCalled()
        expect(mock).toHaveLastReturnedWith("foo")
        done()
    })
    .catch(err=>{
        expect(false)
        done(err)
    })
})

test("the output of an object callback must be json formatted", done=>{
    const testObject = {foo:"bar"}
    const mock = jest.fn(()=>testObject)
    rest.get("/d", mock)

    fetch("/d")
    .then(data=>{
        expect(mock).toHaveBeenCalled()
        expect(mock).toHaveLastReturnedWith(testObject)
        return data.json()
    })
    .then(json=>{
        expect(json).toStrictEqual(testObject)
        done()
    })
    .catch(err=>{
        expect(false)
        done(err)
    })
})

test("The parameters of a call can be read from the first callback parameter", done=>{
    const testObject = {foo:"bar"}
    const mock = jest.fn()
    rest.get("/e", mock)

    fetch("/e?foo=bar")
    .then(data=>{
        expect(mock).toHaveBeenCalledTimes(1)
        expect(mock.mock.calls[0][0]).toMatchObject(testObject)
        done()
    })
    .catch(err=>done(err))
}) 

afterAll(()=>{
    rest.close()
})

test("Will fail with 400 if request does not have the required parameters", done=>{
    const mock = jest.fn()
    rest.get("/f",mock, ["foo", "bar"])

    fetch("/f")
    .then(data=>{
        expect(data.status).toBe(400)
    })
    .then(()=>fetch("/f?foo=a"))
    .then(data=>{
        expect(data.status).toBe(400)
    })
    .then(()=>fetch("/f?foo=a&bar=b"))
    .then(data=>{
        expect(data.status).toBe(200)
    })
    .then(()=>done())
    .catch(err=>done(err))
    
})