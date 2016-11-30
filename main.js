'use strict';
const s3 = require('./lib/s3.js');
const image = require('optimiz');
const awsAuth = require('aws-creds');
const AWS = require('aws-sdk');
const async = require('async');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const url = require('url');

const execute = (imageFilePath, options, callback) => {
  // establish AWS credentials:
  const aws = awsAuth(AWS, 'S3', options);
  // do the main pipeline:
  async.auto({
    process: (done) => {
      image(imageFilePath, options, done);
    },
    upload: ['process', (results, done) => {
      s3.put(aws, options, results.process, done);
    }]
  }, (err, results) => {
    if (options.host) {
      results.upload.Location = `${options.host}${url.parse(results.upload.Location).path}`;
    }
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
