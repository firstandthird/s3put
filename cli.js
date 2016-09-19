const main = require('./main.js');
const _ = require('lodash');

const argv = require('yargs')
.options({
  profile: {
    describe: 'name of aws profile to use',
    default: false
  },
  bucket: {
    describe: 's3 bucket to upload the image to',
    default: 's3-bucket'
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
})
.demand(1)
.argv;

const fileName = _.last(argv._);
main(fileName, argv, (err, results) => {
  if (err) {
    return console.log(err);
  }
  console.log(results);
});
