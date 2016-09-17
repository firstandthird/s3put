module.exports.put = (fileBuffer, key, options) => {
  s3.upload({
    Bucket: options.bucket,
    Key: key,
    Body: fileBuffer
  })
};
