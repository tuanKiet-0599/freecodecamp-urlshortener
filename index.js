require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017");
// Basic Configuration
const port = process.env.PORT || 3000;
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});
const Url = mongoose.model("urls", urlSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    dns.lookup(req.body.url, { all: true }, (err, address, family) => {
      if (err) {
        res.json({ error: "invalid url" });
      } else {
        next();
      }
    });
  },
  (req, res) => {
    const list = Urls.find({});
    const newUrl = { original_url: req.body, short_url: list.length + 1 };
    Url(newUrl).save();
    res.json(newUrl);
  }
);
app.get("api/shorturl/:short_url", (req, res) => {
  const url = Url.findOne({
    short_url: req.params.short_url,
  });
  res.redirect(url.original_url);
});
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
