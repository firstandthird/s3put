/* global describe, it */
const s3put = require('../main.js');
const fs = require('fs');
const path = require('path');
const wreck = require('wreck');
const testImageBase = 'snoopy.jpg';
const testImage = path.join(__dirname, testImageBase);
const testFileBase = 'snoopy.txt';
const testFile = path.join(__dirname, testFileBase);
const datefmt = require('datefmt');
const tap = require('tap');

if (process.env.AWS_BUCKET === undefined) {
  throw new Error('You must define AWS_BUCKET');
}

tap.test('should be able to upload an unmodified image', async(t) => {
  const stream = fs.createReadStream(testImage);
  const options = {
    bucket: process.env.AWS_BUCKET,
    profile: process.env.AWS_PROFILE
  };
  try {
    const response = await s3put(stream, options);
    t.notEqual(response.key.indexOf(testImageBase), -1);
    t.end();
  } catch (e) {
    t.fail();
  }
});

tap.test('should support buffers', (t) => {
  fs.readFile(testImage, async(err, buffer) => {
    const options = {
      bucket: process.env.AWS_BUCKET,
      profile: process.env.AWS_PROFILE,
      path: testImage
    };
    const response = await s3put(buffer, options);
    t.notEqual(response.key.indexOf(testImageBase), -1);
    t.end();
  });
});

tap.test('should be able to upload a file to folder', async(t) => {
  const stream = fs.createReadStream(testImage);
  const options = {
    bucket: process.env.AWS_BUCKET,
    profile: process.env.AWS_PROFILE,
    folder: 'folder'
  };
  const response = await s3put(stream, options);
  t.notEqual(response.key.indexOf('folder'), -1);
  t.end();
});

tap.test('should be able to upload a non-image', async(t) => {
  const stream = fs.createReadStream(testFile);
  const options = {
    bucket: process.env.AWS_BUCKET,
    profile: process.env.AWS_PROFILE
  };
  const response = await s3put(stream, options);
  t.notEqual(response.key.indexOf(testFileBase), -1);
  t.end();
});

tap.test('uses the --prefix option to get the key, by default should upload the image to a sub-folder', async(t) => {
  const stream = fs.createReadStream(testImage);
  const options = {
    bucket: process.env.AWS_BUCKET,
    profile: process.env.AWS_PROFILE,
    noprefix: true
  };
  const response = await s3put(stream, options);
  t.equal(response.key.indexOf(datefmt('%Y-%m-%d', new Date())), -1);
  t.end();
});

tap.test('uses the --public option to control whether the image hosted on s3 is available to everyone --public option will set the ACL for the image to "public":', async(t) => {
  const stream = fs.createReadStream(testImage);
  const options = {
    bucket: process.env.AWS_BUCKET,
    profile: process.env.AWS_PROFILE,
    noprefix: true,
    public: true
  };
  const response = await s3put(stream, options);
  t.equal(typeof response.Location, 'string');
  // now try to get the image from s3 (if it returns anything at all, it was public):
  const { res, payload } = await wreck.get(response.Location);
  t.equal(res.statusCode, 200);
  t.equal(typeof payload, 'object');
  t.end();
});

tap.test('should override host if set', async(t) => {
  const stream = fs.createReadStream(testImage);
  const options = {
    bucket: process.env.AWS_BUCKET,
    profile: process.env.AWS_PROFILE,
    noprefix: true,
    host: 'http://testhost.com',
  };
  const response = await s3put(stream, options);
  t.equal(response.Location, 'http://testhost.com/snoopy.jpg');
  t.end();
});

tap.test('should override host if set with folder', async(t) => {
  const stream = fs.createReadStream(testImage);
  const options = {
    bucket: process.env.AWS_BUCKET,
    profile: process.env.AWS_PROFILE,
    noprefix: true,
    folder: 'blah',
    host: 'http://testhost.com',
  };
  const response = await s3put(stream, options);
  t.equal(response.Location, 'http://testhost.com/blah/snoopy.jpg');
});
