const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new S3Client({
  region: "sfo3",
  endpoint: "https://hale-furniture-project.nyc3.digitaloceanspaces.com",
  credentials: {
    accessKeyId: 'DO007K62PD6YGKD388BM',
    secretAccessKey: 'DWIMl/DRhK6QadZKrSv8LkT91EfhaJf+Imq4QFfe4IE',
  },
  forcePathStyle: true,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'hale-furniture-project',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

async function deleteFileFromBucket(fileKey) {
  try {
    const deleteParams = {
      Bucket: 'hale-project',
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);
    console.log(`File deleted successfully: ${fileKey}`);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

module.exports = {
  upload,
  deleteFileFromBucket,
};



