var sessions = {}

class SessionController {
    GenerateCookie() {
        var cookie
        do {
            cookie = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        } while(cookie in sessions)
        return cookie;
    }
    
    GetCurrentSession(req) {
        const m = /swanrestsess=(.*?)(;|$)/s.exec(req.headers["cookie"])
        if(m) {
            if(m[1] in sessions) {
                return sessions[m[1]]
            }
        }
    
        return {
            cookie: this.GenerateCookie()
        }
    }
    
    SaveSession(sess,res) {
        sessions[sess.cookie] = sess
        res.setHeader("Set-Cookie", "swanrestsess=" + sess.cookie)
    }
}

module.exports = new SessionController()