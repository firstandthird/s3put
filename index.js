'use strict';
const s3 = require('./lib/s3.js');
const image = require('./lib/image.js');
const _ = require('lodash');
const aws_auth = require('./lib/commonAWS');
const async = require('async');
const path = require('path');
const fs = require('fs');

const argv = require('yargs')
.options({
  'profile': {
    describe: 'name of aws profile to use',
    default: false
  },
  'bucket': {
    describe: 's3 bucket to upload the image to',
    default: 's3-bucket'
  },
  'quality': {
    describe: 'set to a number between 0 and 100 to compress the image',
    default: false
  },
  'position': {
    describe: 'used in cropping, indicates the x,y coord for the upper-left corner of the cropping square',
    nargs: 2,
    default: [0,0]
  },
  'size': {
    describe: 'used in cropping, indicates the length of the x,y axes for the cropping square',
    nargs: 2,
    default: false
  },
})
.demand(1)
.argv;

// establish AWS credentials:
const aws = aws_auth(argv);
const fileName = _.last(argv._);

// do the main pipeline:
async.auto({
  compress: (done) => {
    if (argv.quality) {
      return image.compress(fileName, argv.quality, (err, result) => {
        return done(err, result);
      });
    }
    // if no compress, just copy file to /build:
    const destName = path.join('build', fileName);
    fs.mkdirSync('build');
    fs.createReadStream(fileName).pipe(fs.createWriteStream(destName));
    return done(null, destName);
  },
  crop: ['compress', (results, done) => {
    if (argv.size) {
      return image.crop(results.compress, argv.position, argv.size, (err, result) => {
        return done(err, result);
      });
    }
    return done(null, results.compress);
  }],
  upload: ['crop', (results, done) => {
    return s3.put(aws, argv.bucket, results.crop, done);
  }]
}, (err, results) => {
  if (err) {
    console.log(err);
  }
  console.log(results.upload)
});
