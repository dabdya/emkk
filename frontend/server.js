const fs = require("fs");
const path = require("path");
const https = require("https");
const privateKey = fs.readFileSync("./certs/server.key", "utf8");
const certificate = fs.readFileSync("./certs/server.crt", "utf8");

const credentials = { key: privateKey, cert: certificate };
const express = require("express");
const app = express();

const BUILD_FOLDER = "build"

app.use(express.static(path.join(__dirname, BUILD_FOLDER)));

app.get("*", function (req, res) {
	res.sendFile(path.join(__dirname, BUILD_FOLDER, "index.html"));
});

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443);
