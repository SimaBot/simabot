const express = require("express");
const app = express();

exports.init = function (internal) {
    app.listen(process.env.PORT || 3000, () => {

    });

    app.get("/", (req, res) => {
        res.send(internal.textdb.strings.helloWorld);
    });
}
