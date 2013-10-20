var http = require("http");

var JohnnysStatic = require("johnnys-node-static");
JohnnysStatic.setStaticServer({root: "./public"});
JohnnysStatic.setRoutes({
        "/":       { "url": "/html/index.html" },
});

http.createServer(function (req, res) {
     // safe serve
    if (JohnnysStatic.exists(req, res)) {
        // serve file
        JohnnysStatic.serve(req, res, function (err) {
            // not found error
            if (err.code === "ENOENT") {
                res.end("404 - Not found.");
                return;
            }

            // other error
            res.end(JSON.stringify(err));
        });
        return;
    }

    if (req.url === "/getConfig") {
        return res.end(JSON.stringify(require("./credentials.json"), null, 4));
    }

    // serve file
    JohnnysStatic.serveAll(req, res, function(err, result) {
        // check for error
        if (err) {
            res.writeHead(err.status, err.headers);
            res.end();
        } else {
            console.log('%s - %s', req.url, result.message);
        }
    });
}).listen(8000);

console.log("Listening on 8000");
