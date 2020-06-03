# SwanRest
SwanRest is developed as an simple and lightweight way to get started on a rest api quickly.

It is still under development, but this beta version should give the general idea as to what its about.

## Security Warning
This is so far developed without security considerations. Do NOT put this in production as is.

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

## Keywords

Returning simple strings will only get you so far. You can make some simple things happen by returning specially formatted keyword strings.

```javascript
var rest = require("../SwanRest")

rest("/", ()=>{
    return "-file:index.html"
})

rest.start()
```

The example above will return the contents the ```public/index.html``` file, if it exists.

The following keywords exist:
 - ```-redirect:<Location>```: Redirect (302) to the specified url
 - ```-file:<path>```: Serve the specified file in the ```public/``` directory
 - ```-error:<errortext>```: Return an error (500) to the client, with the specified text
 - ```-sql:<SELECT-query>```: Return the specified select query as a JSON array. (requires that you have set up a connection with the ```rest.dbSetup``` function.)

## Todo
The documentation needs to be finalized, and some more testing would still be needed. Feel free to try it out and tell me what you think by either creating a GitHub issue or pull request,
