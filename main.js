'use strict';
const awsAuth = require('aws-creds');
const AWS = require('aws-sdk');
const path = require('path');
const mimeLookup = require('mime-types').lookup;
const datefmt = require('datefmt');
const fs = require('fs');
const url = require('url');
const util = require('util');
module.exports = async(input, options) => {
  if (!options.bucket) {
    throw new Error('bucket must be passed in');
  }
  const aws = awsAuth(AWS, 'S3', options);
  const stream = (typeof input.on === 'function' || Buffer.isBuffer(input)) ? input : fs.createReadStream(input);
  const filename = options.filename || options.path || stream.path;
  if (!filename) {
    throw new Error('must pass in path if a buffer');
  }
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
  const upload = await util.promisify(aws.upload)(s3Options);
  if (!options.host) {
    return;
  }
  upload.Location = url.resolve(options.host, fileKey);
  return upload;
};
