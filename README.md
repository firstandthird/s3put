# s3put
Node library and cli to crop, optimize and upload images and document to s3.  By default images will have their ACL set to "private" and will be sub-foldered by day/timestamp.

## Command Line Usage

### Upload File

`s3put --profile [awsprofile] --bucket bucket-name /path/to/file.jpg`

  will store the file on S3 with a private ACL and return the object's s3 URL. The file will be sub-foldered by date and timestamp so the S3 key will look like  _"[__date__]/[__timestamp__]/file.jpg"_

### Upload File and set its ACL to "public":

  `s3put --profile [awsprofile] --bucket bucket-name --public /path/to/file.png`

  will store the file on S3 with a public ACL

### Upload File directly to the root of the bucket:

  `s3put --profile [awsprofile] --bucket bucket-name --noprefix /path/to/file.png`

  The returned s3 URL will not be sub-foldered by date and timestamp, so the s3 key will just be _"file.jpg"_.

### Upload Image and Compress:

`s3put --profile [awsprofile] --quality 80 --bucket bucket-name /path/to/file.png`

   Will compress an image file with GraphicsMagick and then upload it to S3
### Upload Image and Crop:

`s3put --profile [awsprofile] --position 20,20 --size 100x100 --bucket bucket-name /path/to/file.png`

  Will crop an image file with GraphicsMagic and then upload it to S3

### Use ImageMagick instead of GraphicsMagick to modify the image:

`s3put --profile [awsprofile] --position 20,20 --size 100x100 --bucket bucket-name --imagemagick /path/to/file.png`

 Will crop an image file with ImageMagick and then upload it to S3

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
