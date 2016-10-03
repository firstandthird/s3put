'use strict';
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const os = require('os');

module.exports.compress = (file, level, callback) => {
  const handleResult = result => {
    if (result.length === 0) {
      return callback('Unable to compress image');
    }
    callback(null, result[0].path);
  };
  const options = {
    plugins: [imageminMozjpeg({ quality: level }), imageminPngquant({ quality: level })]
  };
  imagemin([file], os.tmpdir(), options).then(handleResult);
};

module.exports.crop = (im, pathToFile, origin, dims, gravity, callback) => {
  let gm;
  if (im) {
    gm = require('gm').subClass({ imageMagick: true });
  } else {
    gm = require('gm');
  }
  const pathToOutput = pathToFile;
  gm(pathToFile)
  .gravity(gravity)
  .crop(dims[0], dims[1], origin[0], origin[1])
  .write(pathToOutput, (err) => {
    callback(err, pathToOutput);
  });
};
