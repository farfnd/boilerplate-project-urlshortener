require('dotenv').config();
let mongoose = require('mongoose');
const myUri = process.env['MONGO_URI'];
const { Schema } = mongoose;

mongoose.connect(myUri, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: Number
});

let ShortUrl = mongoose.model('ShortUrl', urlSchema);

const findOneByOriginalUrl = (url, done) => {
  ShortUrl.findOne({ original_url: url }, (err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

const findOneByShortUrl = (url, done) => {
  ShortUrl.findOne({ short_url: url }, (err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

const createAndSaveShortUrl = (url, done) => {
  let s = findOneByOriginalUrl(url, async (err, data) => {
    if (data) {
      done(null, data);
    } else {
      if (err) {
        console.error(err);
        done(err);
      } else {
        let i = await ShortUrl.countDocuments({}).exec();
        let s = new ShortUrl(
          {
            original_url: url,
            short_url: i
          }
        );

        s.save((err, data) => {
          if (err) return console.error(err);
          done(null, data);
        });
      }
    }
  })
};

exports.ShortUrlModel = ShortUrl;
exports.findOneByOriginalUrl = findOneByOriginalUrl;
exports.findOneByShortUrl = findOneByShortUrl;
exports.createAndSaveShortUrl = createAndSaveShortUrl;