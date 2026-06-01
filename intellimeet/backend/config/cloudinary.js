const cloudinary = require('cloudinary').v2;

const setupCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

const uploadToCloudinary = async (file, folder = 'meetings') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `intellimeet/${folder}`,
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { setupCloudinary, uploadToCloudinary };