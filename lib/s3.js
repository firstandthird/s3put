'use strict';
const fs = require('fs');
const path = require('path');
const mimeLookup = require('mime-types').lookup;
const datefmt = require('datefmt');

module.exports.put = (s3, argv, fileName, callback) => {
  let fileKey = path.basename(fileName);
  if (argv.noprefix !== true) {
    fileKey = `${datefmt('%Y-%m-%d', new Date())}/${(+new Date)}/${path.basename(fileName)}`;
  }
  const fileBuffer = fs.readFileSync(fileName);
  s3.upload({
    Bucket: argv.bucket,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeLookup(fileName),
  }, (err, data) => {
    callback(err, data);
  });
};
