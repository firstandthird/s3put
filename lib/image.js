const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGm = require('imagemin-gm');

module.exports.compress = (globString, level, callback) => {
  console.log('gonna compress now')
  imagemin([globString], 'build/', {
    plugins: [
        imageminMozjpeg(),
        imageminPngquant({quality: level})
    ]
  })
  .then(result => {
    callback(null, result.path);
  })
};

module.exports.crop = (buffer, callback) => {
  callback()
};
