var http = require("http");
var Url = require("url");
var JohnnysStatic = require("johnnys-node-static");
var qs = require("querystring");

JohnnysStatic.setStaticServer({root: "./public"});
JohnnysStatic.setRoutes({
        "/":       { "url": "/html/index.html" },
});
var Showdown = require('showdown');
var converter = new Showdown.converter();


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

    var url = Url.parse(req.url);

    if (url.pathname === "/getHTML") {
        getFormData(req, res, function (err, formData) {
            if (err) { return sendResponse(req, res, err, 400); }
            var html = converter.makeHtml(formData.markdown);
            res.end(html);
        });
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

function getFormData(request, response, callback) {

    if (typeof response === "function") {
        callback = response;
    }

    // the request method must be 'POST'
    if (request.method == 'POST') {

        var body = '';

        // on data
        request.on('data', function (data) {
            // add data to body
            body += data;
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) {
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                request.connection.destroy();
            }
        });

        // and on end
        request.on('end', function () {
            // parse body
            var POST = qs.parse(body);
            // and callback it!
            callback(undefined, POST);
        });
        return;
    }

    // if it's  a get request, maybe we have some query data
    var queryData = Url.parse(request.url, true).query;

    // if not post, callback undefined
    callback(null, queryData);
}

/*
 *  Send response to the client
 * */
function sendResponse (req, res, content, status, contentType, force) {

    // if not provided, status is 200
    status = status || 200;

    // set the content type
    contentType = contentType || "application/json";

    // set headers and status code
    res.writeHead(status, {
        "Content-Type": contentType
    });

    // handle mongo errors
    if (content instanceof Error) {
        content = content.message;
    }

    // TODO Comments
    var response = (content || {}).constructor === Object ? content : {};
    if (typeof content === "string") {
        response.output = content;
        if (status !== 200) {
            response.error = content;
            delete response.output;
        }
    }

    if (force) {
        res.end(content);
        return;
    }

    res.end(JSON.stringify(response, null, 4));
};
