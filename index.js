require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const urlparser = require("url");

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
  // (req, res, next) => {
  //   console.log(req.body.url);
  //   const url = new URL(req.body.url);
  //   console.log(url);
  //   dns.lookup(url.hostname,(err, address) => {
  //     if (!address) {
  //       console.log(err);
  //       res.json({ error: "invalid url" });
  //     } else {
  //       next();
  //     }
  //   });
  // },
  (req, res) => {
    const url = new URL(req.body.url);
    dns.lookup(url.host, async (error, address) => {
      if (!error) {
        res.json({ error: "invalid url" });
      } else {
        console.log(address);
        const listRange = await urls.countDocuments();
        const newUrl = {
          original_url: url.href,
          short_url: listRange,
        };
        await urls.insertOne(newUrl);
        res.json({ original_url: req.body.url, short_url: listRange });
      }
    });
  }
);
app.get("/api/shorturl/:short_url", async (req, res) => {
  const url = await urls.findOne({ short_url: Number(req.params.short_url) });
  res.redirect(url.original_url);
});

// app.post("/api/shorturl", (req, res) => {
//   const url = req.body.url;
//   const dnslookup = dns.lookup(
//     urlparser.parse(url).hostname,
//     async (err, address) => {
//       if (!address) {
//         res.json({ error: "invalid url" });
//       } else {
//         const urlCount = await urls.countDocuments();
//         const urlDoc = {
//           original_url: url,
//           short_url: urlCount,
//         };
//         const result = await urls.insertOne(urlDoc);
//         res.json({ original_url: url, short_url: urlCount });
//       }
//     }
//   );
// });

// app.get("/api/shorturl/:short_url", async (req, res) => {
//   const url = await urls.findOne({ short_url: +req.params.short_url });
//   if (!url) {
//     res.json({ error: "invalid url" });
//   }
//   res.redirect(url.original_url);
// });

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
