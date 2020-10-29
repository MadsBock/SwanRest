var events = require("events")
var eventEmitter = new events.EventEmitter();
var http = require("http")
var https = require("https")
var url = require("url")
var fs = require("fs")
var mime = require("mime-types")
var form = require("formidable")

var server = 0

function PromiseWrap(input) {
    return new Promise(async resolve=>{
        resolve(await input)
    })
}

module.exports.reportErrors = false;

function InternalError(err, res) {
    console.error(err)
    res.statusCode = 500
    if(module.exports.reportErrors)
        res.end(err)
    else
        res.end()
    
}

function ExternalError(err, res) {
    console.error(err)
    res.statusCode = 400
    res.end(err)
}

module.exports = function(path = "/", callback, method = "GET", expectedParameters=[]) {
    eventEmitter.on(path+method, async function(query, req,res) {
        res.foundPage = true

        //check for expected parameters
        expectedParameters.forEach(parameter=>{
            if(!(parameter in query)) {
                ExternalError(`Expected a ${parameter} parameter but found none`, res)
                return;
            }
        })

        var sess = GetCurrentSession(req)
        var output
        try {
            await PromiseWrap(callback(query,sess))
            .then(oup => {
                output = oup
            })
        } catch(err) {
            InternalError(err,res)
        }

        SaveSession(sess,res)
        if(output)
        switch (typeof(output)) {
            case "string":
                handleString(output, res)
                return;
            case "number":
                handleString(""+output, res)
                return;
            case "object":
                handleObject(output, res)
                return;
            default:InternalError("Unsupported Output. Type was " + typeof(output), res);return;
        }
        else InternalError("Invalid Output", res)
    })
}

function handleString(output, res) {
    var match = /^-(.*?):(.*)$/s.exec(output)
    if(match != null) switch(match[1]){
        case "file": fetchFile("public/"+match[2], res);return;
        case "redirect": redirectTo(match[2], res);return;
        case "error": InternalError(match[2], res);return;
        case "external": ExternalError(match[2], res);return;
    }

    res.end(output)
}

function fetchFile(pathname, res) {
    var mimetype = mime.lookup(pathname)
    fs.readFile(pathname, (err, data)=>{
        if(err){
            res.writeHead(404, "Page not Found")
            res.end()
        } else {
            res.setHeader("Content-Type", mimetype)
            res.end(data)
        }
    })
}

function handleObject(query, res) {
    if(query.constructor.name == "OkPacket") res.end("OK")
    res.end(JSON.stringify(query))
}

function redirectTo(path, res) {
    res.statusCode = 302;
    res.setHeader("Location", path);
    res.end();
}

function getQueryParameters(req, query) {
    if(req.method == "GET") return query;

    var resultObject = {}
    return new Promise((resolve, reject)=>{

        new form.IncomingForm()
        .on("field", (name, value)=>{
            resultObject[name] = value
        })
        .on("file", (name, file)=>{
            resultObject[name] = file
        })
        .on("end", ()=>{
            resolve(resultObject)
        })
        .on("error", (err)=>{
            reject(err)
        })

        .parse(req)

    })
}

async function serverCallback(req,res) {
    var q = url.parse(req.url, true)
    var pathname = q.pathname
    console.log(`[${req.method}] ${pathname}`)
    var parameters = await getQueryParameters(req,q.query)
    res.foundPage = false;
    eventEmitter.emit(pathname + req.method, parameters, req,res)
    if(!res.foundPage) fetchFile("public/"+pathname,res)
}

module.exports.start = function(port = 8080) {
    server = http.createServer(serverCallback)
    server.listen(port)

    console.log("Now listening on port: " + port)
}

module.exports.startHTTPS = function(options, port = 443) {
    server = https.createServer(options, serverCallback)
    server.listen(port)

    console.log("Now listening on port: " + port)
}

module.exports.close = async function() {
    if(server != 0) server.close()
    if(conn) (await conn).close()
}

//Sessions
var sessions = {}

module.exports.cookies = false;

function GenerateCookie() {
    var cookie
    do {
        cookie = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    } while(cookie in sessions)
    return cookie;
}

function GetCurrentSession(req) {
    if(!module.exports.cookies) return null;
    const m = /swanrestsess=(.*?)(;|$)/s.exec(req.headers["cookie"])
    if(m) {
        if(m[1] in sessions) {
            return sessions[m[1]]
        }
    }

    return {
        cookie: GenerateCookie()
    }
}

function SaveSession(sess,res) {
    if(!module.exports.cookies) return

    sessions[sess.cookie] = sess
    res.setHeader("Set-Cookie", "swanrestsess=" + sess.cookie)
}

