var rest = require("../SwanRest")
var mysql = require("mysql")
var fs = require("fs")

var conn;
var sqlFile;

function ConnectPromise() {
    return new Promise((resolve,reject)=>{
        var con = mysql.createConnection({
            host: "localhost",
            user: "swanrest",
            password: "",
            database: "swanrest"
        })

        con.connect((err)=>{
            if(err) reject(err)
            else resolve(con)
        })
    })
}

function SQLFilePromise() {
    return new Promise((resolve, reject)=>{
        fs.readFile("./db.sql", (err, data)=>{
            if(err) reject(err)
            else resolve(data)
        })
    })
}

beforeAll(async ()=>{
    conn = await ConnectPromise()
    sqlFile = await SQLFilePromise()
    rest.start(8082)
    rest.dbSetup("localhost", "swanrest", "", "swanrest")
})

beforeEach(()=>{
    return new Promise((resolve, reject)=>{
        conn.query(sqlFile, (err, data)=>{
            if(err) reject(err)
            else resolve()
        })
    })
})

afterAll(()=>{
    conn.end()
    rest.close()
})

test.only("Test that the correct field is returned", done=>{
    rest.dbQuery("SELECT name FROM people WHERE job='Pilot'")
    .then(v=>{
        expect(v.length).toBe(1)
        expect(v[0].name.toBe("Wash"))
        done()
    }).catch(err=>done(err))
})

