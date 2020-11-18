const Domain = require("./Domain")

var http = require("http")
var https = require("https")
var url = require("url")
var fs = require("fs")
var mime = require("mime-types")
var form = require("formidable")

var server = 0

module.exports = new Domain("default")

module.exports.domains = [module.exports]

module.exports.getDomain = (name) => module.exports.domains.find(o=>o.name===name)

module.exports.reportInternalErrors = false;

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
    module.exports.domains.forEach(d=>d.messageReceived(pathname + req.method, parameters, req,res))
    if(!res.foundPage) fetchFile("public/"+pathname,res)
}

//Control Methods
module.exports.start = function(port = 8080) {
    server = http.createServer(serverCallback)
    server.listen(port)

    console.log("Now listening on port: " + port)

    return module.exports
}

module.exports.startHTTPS = function(options, port = 443) {
    server = https.createServer(options, serverCallback)
    server.listen(port)

    console.log("Now listening on port: " + port)
    return module.exports
}

module.exports.addDomain = (name) => {
    module.exports.domains[name] = new Domain(name)
}

module.exports.close = function() {
    if(server != 0) server.close()
}

module.exports.cookies = false;



