'use strict';
const fs = require('fs');
const path = require('path');
const mimeLookup = require('mime-types').lookup;
module.exports.put = (s3, argv, fileName, callback) => {
  const fileKey = path.basename(fileName);
  const fileBuffer = fs.readFileSync(fileName);
  s3.upload({
    Bucket: argv.bucket,
    Key: fileKey,
    Body: fileBuffer,
    ACL: argv.public ? 'public-read' : 'private',
    ContentType: mimeLookup(fileName),
  }, (err, data) => {
    callback(err, data);
  });
};
