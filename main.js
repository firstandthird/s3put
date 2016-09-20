'use strict';
const s3 = require('./lib/s3.js');
const image = require('./lib/image.js');
const awsAuth = require('./lib/commonAWS');
const async = require('async');
const path = require('path');
const fs = require('fs');
const os = require('os');

const execute = (fileName, argv, callback) => {
  // establish AWS credentials:
  const aws = awsAuth(argv);
  // do the main pipeline:
  async.auto({
    compress: (done) => {
      if (argv.quality) {
        return image.compress(fileName, argv.quality, (err, result) => {
          return done(err, result);
        });
      }
      // if no compress, just copy file to tmp
      const destName = path.join(os.tmpdir(), fileName);
      fs.createReadStream(fileName).pipe(fs.createWriteStream(destName));
      return done(null, destName);
    },
    crop: ['compress', (results, done) => {
      if (argv.size) {
        return image.crop(results.compress, argv.position, argv.size, (err, result) => {
          return done(err, result);
        });
      }
      return done(null, results.compress);
    }],
    upload: ['crop', (results, done) => {
      return s3.put(aws, argv.bucket, results.crop, done);
    }]
  }, (err, results) => {
    callback(err, results.upload);
  });
};

module.exports = (stream, options, callback) => {
  // make sure options is set
  if (options.profile === undefined) {
    options.profile = false;
  }
  let fileName = stream;
  // if it isn't a string then it' a buffer:
  if (typeof stream === 'object' && stream.path) {
    fileName = path.join(os.tmpdir(), path.basename(stream.path));
    stream.pipe(fs.createWriteStream(fileName));
  }
  execute(fileName, options, callback);
};
