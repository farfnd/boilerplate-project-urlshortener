require('dotenv').config();
const express = require('express');
const cors = require('cors');
let bodyParser = require('body-parser');
const dns = require('node:dns');

const app = express();
const {
  ShortUrlModel,
  findOneByOriginalUrl,
  findOneByShortUrl,
  createAndSaveShortUrl
} = require("./mongoose.js");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  const url = new URL(originalUrl);
  dns.lookup(url.hostname, (err, address) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }
    findOneByOriginalUrl(originalUrl, (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      if (data) {
        return res.json({
          original_url: data.original_url,
          short_url: data.short_url
        });
      }
      createAndSaveShortUrl(originalUrl, (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        res.json({
          original_url: data.original_url,
          short_url: data.short_url
        });
      });
    });
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  findOneByShortUrl(shortUrl, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    if (data) {
      res.redirect(data.original_url);
    } else {
      res.json({ error: "invalid url" });
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
