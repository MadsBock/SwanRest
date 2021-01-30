module.exports = (url, opts) => require("node-fetch")(url,opts)
.then(result=>{
    if(result.status >= 400 && result.status <= 500) throw ({
        statusCode: result.status,
        errorMessage: result.statusText,
        result: result
    })

    return result
})