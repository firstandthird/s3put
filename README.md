# s3put
Node library and cli to crop, optimize and upload images and document to s3.

## Command Line Usage

### Upload File

`s3put --profile [awsprofile] --bucket bucket-name /path/to/file.jpg`

returns back the full s3 url

### Upload Image and Compress

`s3put --profile [awsprofile] --quality 80 --bucket bucket-name /path/to/file.png`

### Upload Image and Crop

`s3put --profile [awsprofile] --position 20,20 --size 100x100 --bucket bucket-name /path/to/file.png`

## Library Usage

```javascript
const s3put = require('s3put');
const fs = require('fs');

const stream = fs.createReadStream('/path/to/file.jpg')

const options = {
  quality: 80,
  position: [20, 20],
  size: [100, 100]
};

s3put(stream, options, (err, response) => {
/*
response = {
  //other aws stuff
  url: 'http://example.s3.aws.com/file.jpg'
}
*/
});
```

## Authenticate with S3

There are a few ways to authenticate

1. Pass in aws profile with `--profile [profile]`.  It will read from `~/.aws/credentials`
2. Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` env variables
3. Set `AWS_PROFILE` env variable
