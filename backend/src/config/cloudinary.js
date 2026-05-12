const multer = require('multer');
require('dotenv').config();

let upload;

// Only use Cloudinary if credentials are configured
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'will_add_later'
) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'opencollab',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1200, crop: 'limit' }]
    }
  });

  upload = multer({ storage });
} else {
  // Fallback — store in memory, no Cloudinary
  upload = multer({ storage: multer.memoryStorage() });
}

module.exports = upload;