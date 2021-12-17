var fs = require("fs");
var path = require("path");
var https = require("https");
var privateKey = fs.readFileSync("./certs/cert.key", "utf8");
var certificate = fs.readFileSync("./certs/cert.pem", "utf8");

var credentials = { key: privateKey, cert: certificate };
var express = require("express");
var app = express();

const BUILD_FOLDER = "build"

app.use(express.static(path.join(__dirname, BUILD_FOLDER)));

app.use(function (req, res, next) {
	if (!req.secure) {
		return res.redirect(["https://", req.get("Host"), req.url].join(""));
	}
	next();
});

app.get("*", function (req, res) {
	res.sendFile(path.join(__dirname, BUILD_FOLDER, "index.html"));
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(443);