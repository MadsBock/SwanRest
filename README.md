# SwanRest
SwanRest is developed as an simple and lightweight way to get started on a rest api quickly.

It is still under development, but this beta version should give the general idea as to what its about.

## Security Warning
This is so far developed without security considerations. Do NOT put this in production as is.

## Getting started
### Installation
The module is not yet published, so you must install it through this repository
```bash
npm install https://github.com/MadsBock/SwanRest
```
### Hello World
Make a script called `server.js`, and put the following code inside it:
```javascript
var rest = require("swanrest")

rest("/",()=>{
    return "Hello World"
})

rest.start()
```

Then run it with `npm server.js`. You can then make a request to [port 8080](http://localhost:8080/), and you should receive a text response saying "Hello World"

This is the simplest example of  a server using SwanRest. If someone requests the root folder of the server, the server will respond with a simple text.

You can make multiple sites by making more declarations:

```javascript
var rest = require("swanrest")

rest("/",()=>{
    return "Hello World"
})

rest("/universe",()=>{
    return "Hello Universe"
})

rest.start()
```

if you now make a request to [/universe](http://localhost:8080/universe) you should see the text "Hello Universe" instead of "Hello World"

### Using parameters
The callback function in a rest declaration can take one parameter. This parameter is equal to the Query Parameters in a get request. Hence if you declare a server like this:
```javascript
var rest = require("swanrest")

rest("/", (q)=>{
    return "The parameter is " + q.text
})

rest.start()
```
and then request [/?text=foo](https://localhost:8080/?text=foo), you should get the response "The parameter is foo"

If you make a post request (like, with an HTML form), the parameters can still be fetched the same way.

### File Access

All files that are in a `public/` directory on the same level as your script, will be automatically supplied when requested. Suppose you have a folder structure like this:

```bash
server
├── public
│   ├── index.html
│   └── style.css
└── server.js
```
Where `server.js` looks like this:
```javascript
var rest = require("swanrest")

rest.start()
```
You will be able to be served `index.html` by going to [/index.html](http://localhost:8080/index.html)

If you want to serve a file explicitly through code, you can return a string with this format: `-file:<PathInPublic>`

```javascript
var rest = require("swanrest")

rest("/", ()=>{
    return "-file:index.html"
})

rest.start()
```

### Database Access

```javascript
var rest = require("swanrest")

//Connect to database (only need to call once)
rest.dbSetup("localhost", "rest", "", "rest")

rest("/", ()=>{
    return "-sql:SELECT * FROM test";
})

rest.start()
```

## Todo
 - Finish Readme.MD
 - Documentation
 - Commenting of the source code
 - Logging
 - Query Queueing
 - Cookie Tests and Expiration
