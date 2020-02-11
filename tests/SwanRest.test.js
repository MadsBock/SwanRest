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

function GetBody(path, cb) {
    http.get("http://localhost:8081" + path, res=>{
        body(res, {}, cb)
    })
}
test("Test that the root returns Hello World",done=>{
    GetBody("/", (err,data)=>{
        expect(data).toBe("Hello World!")
        done(err)
    })
})

test("Test that another path doesnt return Hello World", done=>{
    GetBody("/another", (err,data)=>{
        expect(data).toBe("Another Page")
        done(err)
    })
})

test("Test that the system can fetch files implicitly", done=>{
    GetBody("/index.html",(err,data)=>{
        expect(data).toBe(fileContent)
        done(err)
    })
})

test("Test that the system can fetch files explicitly", done=>{
    GetBody("/file", (err,data)=>{
        expect(data).toBe(fileContent)
        done(err)
    })
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
    GetBody("/useSession", (err,data)=>{
        expect(data).toBe("Doesnt")
        expect(data).not.toBe("Works")
        done(err)
    })
})

test("Test that parameters works", done=>{
    GetBody("/echo?data=helloparameter", (err,data)=>{
        expect(data).toBe("helloparameter")
        done(err)
    })
})

test("Test that multiple parameters works", done=>{
    GetBody("/echotwo?data=hello&other=parameter", (err,data)=>{
        expect(data).toBe("helloparameter")
        done(err)
    })
})

afterAll(()=>{
    rest.close()
})