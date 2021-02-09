var sessions = {}

function generateCookie() {
    var cookie
    do {
        cookie = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    } while(cookie in sessions)
    return cookie;
}

class Session {
    constructor() {
        this.meta = {
            privs: ["default"]
        }
        this.refresh()
    }

    refresh() {
        Object.assign(this.meta,{
            cookie: generateCookie(),
            terminationTime: Date.now() + 86400   
        }) 
    }

    grantAccess(domain) {
        if(!(domain in this.meta.privs)) {
            this.meta.privs.push(domain)   
        }
    }

    revokeAccess(domain) {
        var index = this.meta.privs.indexOf(domain)
        if(index>=0) this.meta.privs.splice(index)
    }

    checkHasAccess(domain){
        return this.meta.privs.includes(domain)
    }
}

//EXPORTS
module.exports.GetCurrentSession = (req)=> {
    const m = /swanrestsess=(.*?)(;|$)/s.exec(req.headers["cookie"])
    if(m) {
        if(m[1] in sessions) {
            return sessions[m[1]]
        }
    }

    return new Session()
}

module.exports.SaveSession = (sess,res) => {
    sess.refresh()
    sessions[sess.cookie] = sess
    res.setHeader("Set-Cookie", "swanrestsess=" + sess.cookie)
}