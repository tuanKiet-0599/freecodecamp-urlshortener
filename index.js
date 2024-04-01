require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post(
  "/api/shorturl",
  (req, res, next) => {
    console.log(req.body);
    next();
    // dns.lookup(
    //   "www.t.com",
    //   { family: 6, all: true },
    //   (err, address, family) => {
    //     if (err) {
    //       res.json({ error: "invalid url" });
    //       console.log("err: ", err);
    //     } else {
    //       console.log("address: %j", address);
    //       console.log("family: %j", family);
    //       next();
    //     }
    //   }
    // );
  },
  (req, res) => {
    res.json({ test: "finish" });
  }
);
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
