const express = require("express");
const path = require("path");
const app = express();

const PORT = 80;
const BUILD_FOLDER = "build";

app.use(express.static(path.join(__dirname, BUILD_FOLDER)));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, BUILD_FOLDER, "index.html"));
});

app.listen(80);