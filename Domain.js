const sessionController = require("./Sessions")

function PromiseWrap(input) {
    return new Promise(async resolve=>{
        resolve(await input)
    })
}

function handleString(output, res) {
    var match = /^-(.*?):(.*)$/s.exec(output)
    if(match != null) switch(match[1]){
        case "file": fetchFile("public/"+match[2], res);return;
        case "redirect": redirectTo(match[2], res);return;
    }

    res.end(output)
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

function error(err, res) {
    const error = err.isRestCreated ? err.error : err
    const errno = err.isRestCreated ? err.errno : 500

    res.statusCode = errno
    if(err.errno<500 && err.errno>=400)
        res.end(error)
    else
        res.end()

    console.error(err.error)
    
}

module.exports = class Domain extends require("events").EventEmitter {
    constructor(name) {
        super()
        this.name = name
    }

    main(path = "/", callback, method = "GET", expectedParameters=[]) {
        this.on(path+method, async function(query, req,res) {
            //if(res.foundPage) return
            res.foundPage = true
    
            //check for expected parameters
            var missingParameters = []
            expectedParameters.forEach(parameter=>{
                if(!(parameter in query)) {
                    missingParameters.push(parameter)
                    return;
                }
            })
            if(missingParameters.length>0) {
                error({error:`Missing the following parameters: (${missingParameters.join(", ")})`, isRestCreated:true,errno:400}, res)
                return;
            }
    
            var sess = sessionController.GetCurrentSession(req)
            var output
            try {
                await PromiseWrap(callback(query,sess))
                .then(oup => {
                    output = oup
                })
            } catch(err) {
                error(err, res)
            }
    
            sessionController.SaveSession(sess,res)
            switch (typeof(output || "")) {
                case "string":
                    handleString(output, res)
                    return;
                case "number":
                    handleString(""+output, res)
                    return;
                case "object":
                    handleObject(output, res)
                    return;
                default:error("Unsupported Output. Type was " + typeof(output), res);return;
            }
        })
    }

    messageReceived(message, parameters, req, res) {
        //TODO verify session authentication here

        this.emit(message, parameters, req, res)
    }

    get(path, callback, expectedParameters = []) {
        this.main(path,callback,"GET", expectedParameters)
    } 

    post(path, callback, expectedParameters = []) {
        this.main(path,callback,"POST", expectedParameters)
    } 
    
    createError(errno, err) {
        return {isRestCreated: true, errno:errno, err:err}
    } 
}