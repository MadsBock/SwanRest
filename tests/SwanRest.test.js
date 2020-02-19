var rest = require("../SwanRest")
var http = require("http")
var body = require("body")
var fs = require("promise-fs")

var fileContent = 0

beforeAll(()=>{
    rest.cookies = true
    rest("/", ()=>{
        return "Hello World!"
    })

    rest("/another", ()=>{
        return "Another Page"
    })

    rest("/file", ()=>{
        return "-file:index.html"
    })

    rest("/startSession", (q,session)=>{
        session.login = "JohnCena"
        return null
    })

    rest("/useSession", (q, session)=>{
        if(session.login == "JohnCena") {
            return "Works"
        } else {
            return "Doesnt"
        }
    })

    rest("/echo", q=>{
        return q.data;
    })
    
    rest("/echotwo", q=>{
        return q.data + q.other;
    })

    rest.start(8081)

    return fs.readFile("./public/index.html").then((v)=>{
        fileContent = v.toString()
    })
})

function GetBody(path) {
    return new Promise((resolve,reject)=>{
        http.get("http://localhost:8081" + path, res=>{
            body(res, {}, (err,data)=>{
                if(err) reject(err)
                else resolve(data)
            })
        })
    })
}



test("Test that the root returns Hello World",done=>{
    GetBody("/").then(data=>{
        expect(data).toBe("Hello World!")
        done()
    }).catch(e=>done(e))
})

test("Test that another path doesnt return Hello World", done=>{
    GetBody("/another").then(data=>{
        expect(data).toBe("Another Page")
        done()
    }).catch(e=>done(e))
})

test("Test that the system can fetch files implicitly", done=>{
    GetBody("/index.html").then(data=>{
        expect(data).toBe(fileContent)
        done()
    }).catch(e=>done(e))
})

test("Test that the system can fetch files explicitly", done=>{
    GetBody("/file").then(data=>{
        expect(data).toBe(fileContent)
        done()
    }).catch(e=>done(e))
})

test("Test that a session can be created, and used", done=>{
    http.get("http://localhost:8081/startSession", res => {
        var cookie = res.headers["set-cookie"]
        http.get("http://localhost:8081/useSession", {
            headers: {cookie: cookie}
        }, res=>body(res,{}, (err,data) => {
            expect(data).toBe("Works")
            done(err)
        }))
    })
    .on("error", err => {
        done(err)
    })
})

test("Test that accessing 'useSession' without cookies, will yield Doesnt", done=>{
    GetBody("/useSession").then(data=>{
        expect(data).toBe("Doesnt")
        expect(data).not.toBe("Works")
        done()
    }).catch(e=>done(e))
})

test("Test that parameters works", done=>{
    GetBody("/echo?data=helloparameter").then(data=>{
        expect(data).toBe("helloparameter")
        done()
    }).catch(e=>done(e))
})

test("Test that multiple parameters works", done=>{
    GetBody("/echotwo?data=hello&other=parameter").then(data=>{
        expect(data).toBe("helloparameter")
        done()
    }).catch(e=>done(e))
})

afterAll(()=>{
    rest.close()
})