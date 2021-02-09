//Declarations
const http = require("http")
const url  = require("url")
const sessions = require("./Sessions")
const formidable = require("formidable")

var paths = {}

//The methods that will be copied to every domain obj
function createPathObj(cb, domain) {
    return {
        callback:cb,
        domain:domain
    }
}
function get(path, cb, domain) {
    paths[path+"GET"] = createPathObj(cb,domain)
}

function post(path, cb, domain) {
    paths[path+"POST"] = createPathObj(cb,domain)
}

function createDomain(name) {
    if(name in module.exports) throw `The name '${name}' cannot be used as a domain`
        const domain = {
            get:(path,cb)=>get(path,cb,name),
            post:(path,cb)=>post(path,cb,name)
        }

    return domain
}

//Adding a default domain
const defaultDomain = createDomain("default")
module.exports = defaultDomain.get
module.exports.get = defaultDomain.get
module.exports.post = defaultDomain.post

//Exports
module.exports.domain = {
    add: (name)=> {
        const domain = createDomain(name)
        module.exports[name] = domain
    }
}

//Helper functions
function ExternalError(statusCode, text, res) {
    res.statusCode = statusCode
    res.end(text)
}

function InternalError(statusCode, text, res) {
    res.statusCode = statusCode
    console.error(text)
    res.end()
}

function UnpackGetParameters(req) {
    var fields = {}
    new URL(req.url, "http://localhost:8080").searchParams.forEach((v,k)=>{
        fields[k] = v
    })
    return fields
}

function UnpackPostParameters(req) {
    var fields = {}

    return new Promise((resolve,reject)=>{
        new formidable.IncomingForm()
        .on("field", (name,value)=>{
            fields[name] = value
        })
        .on("end", ()=>{
            resolve(fields)
        })
        .on("error", err=>{
            reject(err)
        })
        .parse(req)
    })
}

const UnpackParameters = {
    GET: UnpackGetParameters,
    POST: UnpackPostParameters
}

async function ServerCallback(req,res) {
    var urlparsed = url.parse(req.url).pathname
    var path = paths[urlparsed+req.method]

    if(path) {
        //Unpack Parameters
        var params = await UnpackParameters[req.method](req)

        //Get Session
        const sess = sessions.GetCurrentSession(req)

        if(!sess.checkHasAccess(path.domain)){
            ExternalError(403, "Access Forbidden", res)
            return;
        }

        var response = path.callback(params, sess)

        //Save Session
        sessions.SaveSession(sess, res)

        res.end(response)
    } else {
        ExternalError(404, "Resource not Found", res)
    }
}

var server = null
//Creating the start method
module.exports.start = (port=8080) => {
    server = http.createServer((req,res)=>{
        try {
            ServerCallback(req,res)
        } catch(err) {
            InternalError(500, err, res)
        }
    })
    server.listen(port)
}

module.exports.stop = () => {
    if(server) server.close()
}






