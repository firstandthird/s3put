#! /usr/bin/env node
const main = require('./main.js');
const _ = require('lodash');

const argv = require('yargs')
.options({
  profile: {
    describe: 'name of aws profile to use',
    default: false
  },
  noprefix: {
    describe: 'organize the uploaded image by day and timestamp in your bucket',
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
  gravity: {
    describe: 'used in cropping, indicates the relative gravity of the crop position',
    default: 'NorthWest'
  },
  imagemagick: {
    describe: 'by default will use GraphicsMagick, set to true to use the ImageMagick binaries',
    default: false
  },
  maxAge: {
    describe: 'Specify time in seconds that you want the object to remain cached',
    default: false
  },
  host: {
    describe: 'use an alternate CDN host instead of the default s3 host as the url',
    default: false
  },
  public: {
    describe: "set the object's ACL to 'public-read' in s3. the --acl option takes precedence over this one",
    default: false
  },
  acl: {
    describe: 'specify a canned ACL tag (http://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) for the object on s3',
    default: 'private'
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
