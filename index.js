const s3 = require('./lib/s3.js');
const image = require('./lib/image.js');
const _ = require('lodash');
const aws_auth = require('./lib/commonAWS');
const async = require('async');

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
    default: [0,0]
  },
  'size': {
    describe: 'used in cropping, indicates the length of the x,y axes for the cropping square',
    default: [0,0]
  },
})
.argv;

// establish AWS credentials:
const aws = aws_auth(argv);

// do the main pipeline:
async.auto({
  compress: (done) => {
    if (argv.quality) {
      return image.compress(fileName, argv.quality, (err, result) => {
        return done(err, result);
      });
    }
    return done(null, fileName);
  },
  crop: ['compress', (results, done) => {
    if (argv.size) {
      return image.crop(results.compress, argv.size, argv.position, (err, result) => {
        return done();
      })
    }
    return done(null, results.compress);
  }],
  upload: ['crop', (results, done) => {
    return s3.upload(aws, argv.bucket, results.crop)
    console.log('uploading')
    return done();
  }]
}, (err, results) => {
  console.log('all done!')
  if (err) {
    console.log(err);
  }
  console.log(results)
});
