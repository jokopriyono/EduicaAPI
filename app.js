var express = require('express');
var app = express();

app.listen(3000, () => {
    console.log("Server berjalan di port 3000")
});

app.get("/", (req, res, next) => {
    res.json([
        "Joko",
        "Encusilo",
        "Syukron",
        "Zein",
        "Dll.."
    ])
});