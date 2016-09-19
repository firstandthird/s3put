'use strict';
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const gm = require('gm').subClass({ imageMagick: true });

module.exports.compress = (pathToFile, level, callback) => {
  imagemin([pathToFile], 'build/', {
    plugins: [
        imageminMozjpeg(),
        imageminPngquant({quality: level})
    ]
  })
  .then(result => {
    if (result.length === 0) {
      callback('Unable to compress image');
    }
    callback(null, result[0].path);
  })
};

module.exports.crop = (pathToFile, origin, dims, callback) => {
  const pathToOutput = pathToFile;
  gm(pathToFile)
  .crop(dims[0], dims[1], origin[0], origin[1])
  .write(pathToOutput, (err) => {
    callback(err, pathToOutput);
  });
};
