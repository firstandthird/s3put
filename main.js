'use strict';
const s3 = require('./lib/s3.js');
const image = require('./lib/image.js');
const awsAuth = require('./lib/commonAWS');
const async = require('async');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const execute = (imageFilePath, options, callback) => {
  // establish AWS credentials:
  const aws = awsAuth(options);
  // do the main pipeline:
  async.auto({
    optimizeSvg: (done) => {
      if (path.extname(imageFilePath).toLowerCase() === '.svg') {
        return image.svgOptimize(imageFilePath, done);
      }
      return done(null, imageFilePath);
    },
    compress: ['optimizeSvg', (results, done) => {
      if (options.quality && options.quality !== 100) {
        return image.compress(imageFilePath, options.quality, done);
      }
      return done(null, imageFilePath);
    }],
    crop: ['compress', (results, done) => {
      if (options.size) {
        return image.crop(options.imagemagick, results.compress, options.position, options.size, options.gravity, (err, result) => {
          return done(err, result);
        });
      }
      return done(null, results.compress);
    }],
    upload: ['crop', (results, done) => {
      return s3.put(aws, options, results.crop, done);
    }],
  }, (err, results) => {
    callback(err, results.upload);
  });
};

module.exports = (stream, options, callback) => {
  const originalFilePath = typeof stream === 'string' ? stream : stream.path;
  const tmpFilePath = path.join(os.tmpdir(), path.basename(originalFilePath));
  const originalCallback = callback;
  // wrap the callback so it cleans up and returns the results:
  callback = (err, uploadResult) => {
    fs.remove(tmpFilePath);
    return originalCallback(err, uploadResult);
  };
  // make sure options is set
  if (options.profile === undefined) {
    options.profile = false;
  }
  // make sure the tmp file is written into the tmp folder:
  if (typeof stream === 'object' && stream.path) {
    const writeStream = fs.createWriteStream(tmpFilePath);
    writeStream.on('finish', () => {
      execute(tmpFilePath, options, callback);
    });
    stream.pipe(writeStream);
  } else {
    // just copy the file to the temp folder:
    fs.copySync(originalFilePath, tmpFilePath);
    execute(tmpFilePath, options, callback);
  }
};
