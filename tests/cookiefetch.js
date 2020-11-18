var storedCookies = {}
const fetch = require("node-fetch")
function main(path) {
    var cookies = []
    for (var name in storedCookies) {
        cookies.push(`${name}=${storedCookies[name]}`)
    }
    
    var res = fetch(path, {headers:{cookie:cookies.join("; ")}})

    res
    .then(res=>{
        res.headers.raw()["set-cookie"].forEach(v=>{
            const splitted = /^(.+)=(.+)$/.exec(v)
            storedCookies[splitted[1]] = splitted[2]
            console.log(storedCookies)
        })
    })
    .catch(err=>{
        console.error(err)
    })

    return res
}

module.exports = main