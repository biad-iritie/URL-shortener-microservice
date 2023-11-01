require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const fs = require("fs");
const { json } = require("body-parser");

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
// MANAGEMENT OF SHORT URL
function management_url(action, input) {
  db = "./db/data.json";
  console.log(fs.existsSync(db));
  if (!fs.existsSync(db)) {
    fs.closeSync(fs.openSync(db, "w"));
  }

  let data = fs.readFileSync(db);
  if (action == "save" && input != null) {
    if (data.length === 0) {
      // add new url
      fs.writeFileSync(db, JSON.stringify([input], null, 2));
    } else {
      let json_data = JSON.parse(file.toString());
      // check if url exists in our database
      let inputExist = [];
      data_saved = json_data.map((x) => x.original_url);
      let checkInput = data_saved.includes(input.original_url);
      if (!checkInput) {
        // if the url doesn't exist in the database
        json_data.push(input);
        fs.writeFileSync(db, JSON.stringify(json_data, null, 2));
      }
    }
  } else if (action == "load" && input == null) {
    if (data.length == 0) {
      return;
    } else {
      let json_data = JSON.parse(file);
      return json_data;
    }
  }
}
// GENERATE SHORT URL
function generate_short_url() {
  let min = 1;
  let max = 10000;
  //load data
  data = management_url("load");

  if (data != undefined && data.length > 0) {
    max = data.length * 100;
  }
  let short = Math.ceil(Math.random() * (max - min + 1) + min);
  if (data === undefined) {
    return short;
  } else {
    // make we are not duplicating a short url
    let short_urls = data.map((x) => x.short_url);
    let check_url = short_urls.includes(short);
    if (check_url) {
      generate_short_url();
    } else {
      return short;
    }
  }
}
app.post(
  "/api/shorturl",
  (req, res, next) => {
    const url = req.body.url;
    console.log(url);
    const regex = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gim;
    domain = url.match(regex);
    param = domain[0].replace(/^https?:\/\//i, "");
    dns.lookup(param, (err, address, family) => {
      if (err) {
        res.json({ error: "invalid url" });
      } else {
        next();
      }
    });
  },
  (req, res) => {
    short = generate_short_url();
    dict = { original_url: req.body.url, short_url: short };
    management_url("save", dict);
    res.json(dict);
  }
);

app.get("/api/shorturl/:short_url", (req, res) => {});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
