const chai = require('chai');
const s3put = require('../main.js');
const fs = require('fs');
const path = require('path');

const testImageBase = 'snoopy.jpg';
const testImage = path.join(__dirname, testImageBase);

describe('can be used as a library', () => {
  it('should be able to crop/compress/upload an image without error', (done) => {
    const stream = fs.createReadStream(testImage);
    const options = {
      bucket: 'test-bucket',
      profile: false,
      quality: 80,
      position: [20, 20],
      size: [100, 100],
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
