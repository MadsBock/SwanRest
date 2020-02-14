var events = require("events")
var eventEmitter = new events.EventEmitter();
var http = require("http")
var https = require("https")
var url = require("url")
var fs = require("fs")
var body = require("body/form")
var mime = require("mime-types")

var conn = 0
var server = 0

module.exports = function(path = "/", callback, method = "GET") {
    eventEmitter.on('SwanRest'+method, async function(qPath, query, req,res) {
        if(path == qPath && !res.foundPage) {
            res.foundPage = true
            var sess = GetCurrentSession(req)
            var output = await callback(query, sess)
            SaveSession(sess,res)
            if(output)
            switch (typeof(output)) {
                case "string":
                    handleString(output, res)
                    return;
                case "object":
                    handleObject(output, res)
                    return;
            }
            res.end()
        }
    })
}

function handleString(output, res) {
    var match = /^-(.*?):(.*)$/s.exec(output)
    if(match != null) switch(match[1]){
        case "sql": respondQuery(match[2], res);return;
        case "file": fetchFile("public/"+match[2], res);return;
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

function outputError(err, res) {
    var oup = {
        title: "Unhandled Internal Error",
        error_number: err.errno,
        text: err.code
    }
    console.log(JSON.stringify(oup), " ", 2)
    switch (err.errno) {
        case 1146:
            oup.text = "Error in Query Syntax, are you sure that the table exist?"
            break;
        case 1049:
            oup.text = "Error in Connecting to Database, are you sure that the database exist?"
            break;
        case 1045:
            oup.text = "Connection to database denied, check your credentials"
            break;
        default:
            oup.suggestion = "Please report this error code to <EMAIL> for future handling of this error"
            break;
    }
    if(res) {
        res.end(JSON.stringify(oup," ", 2))
    }
}

function getQueryParameters(req, query, cb) {
    if(req.method == "POST")
        body(req, {}, (err,form)=>{
            if(err) console.error(err)
            cb(form)
        })
    else cb(query)
}

function serverCallback(req,res) {
    var q = url.parse(req.url, true)
    var pathname = q.pathname
    console.log(`[${req.method}] ${q.pathname}`)
    getQueryParameters(req,q.query,(query)=>{
        res.foundPage = false;
        eventEmitter.emit('SwanRest' + req.method, pathname, query, req,res)
        if(!res.foundPage) fetchFile("public/"+pathname,res)
    })
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

module.exports.close = function() {
    if(server != 0) server.close()
    if(conn != 0) conn.close()
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

//Database
module.exports.dbSetup = function(host = "localhost", user = "root", password="", database=null) {
    var mysql = require('mysql')

    var connParams = {
        host: host,
        user: user,
        password: password,
        dateString:true
    }

    if(database) {
        connParams.database = database
    }

    var con = mysql.createConnection(connParams)
    
    con.connect(function(err) {
        if(err) outputError(err)
        conn = con
    })
}

function databaseError(res) {
    console.error("Database has not been connected to")
    res.writeHead(500)
    res.end()
}

function respondQuery(query, res) {
    if(conn==0) {
        databaseError(res)
    }

    else conn.query(query, (err,data)=>{
        if(err) outputError(err, res)
        else res.end(JSON.stringify(data))
    })
}

module.exports.dbQuery = async function(query, ...parameters) {
    if(conn==0) {
        console.error("Database has not been connected to")
    }
    
    else return new Promise((resolver,error)=>
        conn.query(query, parameters, (err,data)=>{
            if(err) error(err)
            else resolver(data)
        })
    )
}