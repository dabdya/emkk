var fs = require("fs");
var path = require("path");
var https = require("https");
var privateKey = fs.readFileSync("./server.key", "utf8");
var certificate = fs.readFileSync("./server.crt", "utf8");

var credentials = { key: privateKey, cert: certificate };
var express = require("express");
var app = express();

const BUILD_FOLDER = "build"

app.use(express.static(path.join(__dirname, BUILD_FOLDER)));

app.get("*", function (req, res) {
	res.sendFile(path.join(__dirname, BUILD_FOLDER, "index.html"));
});

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443);
