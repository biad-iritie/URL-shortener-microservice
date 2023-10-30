require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});
// GENERATE SHORT URL
function generate_url() {
  let min = 1;
  let max = 10000;

  let short = Math.ceil(Math.random() * (max - min + 1) + min);

  return short;
}
app.post(
  "/api/shorturl",
  (req, res, next) => {
    const url = req.body.url;
    const regex = /^https?:\/\//;
    if (url.match(regex)) {
      dns.lookup(url.replace(regex, ""), (err, address, family) => {
        if (err) {
          res.json({ error: "invalid url" });
        } else {
          next();
        }
      });
    } else {
      res.json({ error: "invalid url" });
    }
  },
  (req, res) => {
    res.json({ original_url: req.body.url, short_url: generate_url() });
  }
);

app.get("/api/shorturl/:short_url", (req, res) => {});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
