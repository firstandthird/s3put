#! /usr/bin/env node
const main = require('./main.js');
const _ = require('lodash');

const argv = require('yargs')
.options({
  profile: {
    describe: 'name of aws profile to use',
    default: false
  },
  public: {
    describe: 'set the object as public in s3',
    default: false
  },
  bucket: {
    describe: 's3 bucket to upload the image to',
    demand: true
  },
  quality: {
    describe: 'set to a number between 0 and 100 to compress the image',
    default: false
  },
  position: {
    describe: 'used in cropping, indicates the x,y coord for the upper-left corner of the cropping square',
    nargs: 2,
    default: [0, 0]
  },
  size: {
    describe: 'used in cropping, indicates the length of the x,y axes for the cropping square',
    nargs: 2,
    default: false
  },
  imagemagick: {
    describe: 'by default will use GraphicsMagick, set to true to use the ImageMagick binaries',
    default: false
  }
})
.demand(1)
.demand('bucket')
.argv;

const fileName = _.last(argv._);
main(fileName, argv, (err, results) => {
  if (err) {
    return console.log(err);
  }
  console.log(results);
});
