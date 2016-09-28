const chai = require('chai');
const s3put = require('../main.js');
const fs = require('fs');
const path = require('path');

const testImageBase = 'snoopy.jpg';
const testImage = path.join(__dirname, testImageBase);
const testFileBase = 'snoopy.txt';
const testFile = path.join(__dirname, testFileBase);

describe('can be used as a library', () => {
  if (process.env.AWS_BUCKET === undefined || process.env.AWS_PROFILE === undefined) {
    console.log('You must define an AWS_BUCKET and an AWS_PROFILE environment variable to test against!');
    process.exit();
  }
  it('should be able to upload an unmodified image', (done) => {
    const stream = fs.createReadStream(testImage);
    const options = {
      bucket: process.env.AWS_BUCKET,
      profile: process.env.AWS_PROFILE
    };
    s3put(stream, options, (err, response) => {
      if (err) {
        console.log(err);
      }
      chai.expect(response.key).to.include(testImageBase);
      done();
    });
  });
  it('should be able to upload a non-image', (done) => {
    const stream = fs.createReadStream(testFile);
    const options = {
      bucket: process.env.AWS_BUCKET,
      profile: process.env.AWS_PROFILE
    };
    s3put(stream, options, (err, response) => {
      if (err) {
        console.log(err);
      }
      chai.expect(response.key).to.include(testFileBase);
      done();
    });
  });
  it('should be able to crop and then upload an image', (done) => {
    const stream = fs.createReadStream(testImage);
    const options = {
      bucket: process.env.AWS_BUCKET,
      profile: process.env.AWS_PROFILE,
      position: [20, 20],
      size: [100, 100]
    };
    s3put(stream, options, (err, response) => {
      if (err) {
        console.log(err);
      }
      chai.expect(response.key).to.include(testImageBase);
      done();
    });
  });
  it('should be able to compress and then upload an image', (done) => {
    const stream = fs.createReadStream(testImage);
    const options = {
      bucket: process.env.AWS_BUCKET,
      profile: process.env.AWS_PROFILE,
      quality: 50
    };
    s3put(stream, options, (err, response) => {
      if (err) {
        console.log(err);
      }
      chai.expect(response.key).to.include(testImageBase);
      done();
    });
  });
  it('should be able to crop/compress/upload an image without error', (done) => {
    const stream = fs.createReadStream(testImage);
    const options = {
      bucket: process.env.AWS_BUCKET,
      profile: process.env.AWS_PROFILE,
      quality: 80,
      position: [10, 10],
      size: [120, 120],
    };
    s3put(stream, options, (err, response) => {
      if (err) {
        console.log(err);
      }
      chai.expect(response.key).to.include(testImageBase);
      done();
    });
  });
});
