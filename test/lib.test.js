/* global describe, it */
const chai = require('chai');
const s3put = require('../main.js');
const fs = require('fs');
const path = require('path');
const wreck = require('wreck');
const testImageBase = 'snoopy.jpg';
const testImage = path.join(__dirname, testImageBase);
const testFileBase = 'snoopy.txt';
const testFile = path.join(__dirname, testFileBase);
const datefmt = require('datefmt');

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
        return done(err);
      }
      chai.expect(response.key).to.include(testImageBase);
      done();
    });
  });

  it('should be able to upload a file to folder', (done) => {
    const stream = fs.createReadStream(testImage);
    const options = {
      bucket: process.env.AWS_BUCKET,
      profile: process.env.AWS_PROFILE,
      folder: 'folder'
    };
    s3put(stream, options, (err, response) => {
      if (err) {
        return done(err);
      }
      chai.expect(response.key).to.include('folder');
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
        return done(err);
      }
      chai.expect(response.key).to.include(testFileBase);
      done();
    });
  });
});

describe('uses the --prefix option to get the key', () => {
  it('by default should upload the image to a sub-folder', (done) => {
    const stream = fs.createReadStream(testImage);
    const options = {
      bucket: process.env.AWS_BUCKET,
      profile: process.env.AWS_PROFILE,
      noprefix: true
    };
    s3put(stream, options, (err, response) => {
      if (err) {
        return done(err);
      }
      chai.expect(response.key).to.not.include(datefmt('%Y-%m-%d', new Date()));
      done();
    });
  });
});

describe('uses the --public option to control whether the image hosted on s3 is available to everyone', () => {
  it('--public option will set the ACL for the image to "public":', (done) => {
    const stream = fs.createReadStream(testImage);
    const options = {
      bucket: process.env.AWS_BUCKET,
      profile: process.env.AWS_PROFILE,
      noprefix: true,
      public: true
    };
    s3put(stream, options, (err, response) => {
      if (err) {
        return done(err);
      }
      chai.expect(typeof response.Location).to.equal('string');
      // now try to get the image from s3 (if it returns anything at all, it was public):
      wreck.get(response.Location, (err, response, payload) => {
        chai.expect(err).to.equal(null);
        chai.expect(payload).to.exist;
        done();
      });
    });
  });
});
