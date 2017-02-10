'use strict';
const awsAuth = require('aws-creds');
const AWS = require('aws-sdk');
const async = require('async');
const path = require('path');
const mimeLookup = require('mime-types').lookup;
const datefmt = require('datefmt');
const fs = require('fs');
const url = require('url');

module.exports = (input, options, allDone) => {
  if (!options.bucket) {
    return allDone(new Error('bucket must be passed in'));
  }
  async.autoInject({
    aws(done) {
      const aws = awsAuth(AWS, 'S3', options);
      done(null, aws);
    },
    stream(done) {
      if (typeof input.on === 'function') {
        return done(null, input);
      }
      if (Buffer.isBuffer(input)) {
        return done(null, input);
      }
      const stream = fs.createReadStream(input);
      done(null, stream);
    },
    filename(stream, done) {
      const filename = options.filename || options.path || stream.path;
      if (!filename) {
        return done(new Error('must pass in path if a buffer'));
      }
      done(null, filename);
    },
    s3Options(filename, stream, done) {
      let fileKey = path.basename(filename);
      if (options.noprefix !== true) {
        fileKey = `${datefmt('%Y-%m-%d', new Date())}/${(+new Date)}/${fileKey}`;
      }
      if (options.folder) {
        fileKey = path.join(options.folder, fileKey);
      }
      const s3Options = {
        Bucket: options.bucket,
        Key: fileKey,
        Body: stream,
        ACL: options.public ? 'public-read' : 'private',
        ContentType: mimeLookup(filename),
      };
      if (options.maxAge) {
        s3Options.CacheControl = `max-age=${options.maxAge}`;
      }
      if (s3Options.acl) {
        s3Options.ACL = options.acl;
      }
      done(null, s3Options);
    },
    upload(aws, s3Options, done) {
      aws.upload(s3Options, done);
    },
    location(upload, done) {
      if (!options.host) {
        return done();
      }
      upload.Location = `${options.host}${url.parse(upload.Location).path}`;
      done();
    }
  }, (err, results) => {
    if (err) {
      return allDone(err);
    }
    allDone(null, results.upload);
  });
};
