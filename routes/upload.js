const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new S3Client({
  region: "sfo3",
  endpoint: "https://sfo3.digitaloceanspaces.com",
  credentials: {
    accessKeyId: 'DO002VUHPJDJGAB8FQ9C',
    secretAccessKey: '13E6HNQfVf+L9K6TdzpL6HggtYF0vW8eOuFQOkq36PM',
  },
  forcePathStyle: true,
});

// Configure Multer-S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'hale-project',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

module.exports = upload;

