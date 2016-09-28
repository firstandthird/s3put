'use strict';
const fs = require('fs');
const path = require('path');
const mimeLookup = require('mime-types').lookup;
module.exports.put = (s3, bucketName, fileName, callback) => {
  const fileKey = path.basename(fileName);
  const fileBuffer = fs.readFileSync(fileName);
  s3.upload({
    Bucket: bucketName,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeLookup(fileName),
  }, (err, data) => {
    callback(err, data);
  });
};
