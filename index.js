require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

// Basic Configuration
const port = process.env.PORT || 3000;
const client = new MongoClient("mongodb://localhost:27017");
const db = client.db("url-shortener");
const urls = db.collection("urls");

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
    dns.lookup(req.body.url, { all: true }, (err, address) => {
      if (err) {
        res.json({ error: "invalid url" });
      } else {
        next();
      }
    });
  },
  async (req, res) => {
    const listRange = await urls.countDocuments();
    const newUrl = {
      original_url: req.body.url,
      short_url: listRange,
    };
    await urls.insertOne(newUrl);
    delete newUrl._id;
    res.json(newUrl);
  }
);
app.get("api/shorturl/:short_url", async (req, res) => {
  console.log(req.params.short_url);
  const url = await urls.findOne({ short_url: +req.params.short_url });
  res.redirect(url.original_url);
});
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
