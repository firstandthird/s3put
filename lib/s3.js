'use strict';
const fs = require('fs');
const path = require('path');
const mimeLookup = require('mime-types').lookup;
const datefmt = require('datefmt');

module.exports.put = (s3, argv, fileName, callback) => {
  let fileKey = path.basename(fileName);
  if (argv.noprefix !== true) {
    fileKey = `${datefmt('%Y-%m-%d', new Date())}/${(+new Date)}/${fileKey}`;
  }
  const fileBuffer = fs.readFileSync(fileName);
  const options = {
    Bucket: argv.bucket,
    Key: fileKey,
    Body: fileBuffer,
    ACL: argv.public ? 'public-read' : 'private',
    ContentType: mimeLookup(fileName),
  };
  if (argv.maxAge) {
    options.CacheControl = `max-age=${argv.maxAge}`;
  }
  s3.upload(options, (err, data) => {
    callback(err, data);
  });
};
