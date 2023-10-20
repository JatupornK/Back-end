const cloudinary = require("../config/cloudinary");

exports.upload = async (filePath, publicId) => {
  const option = {
    unique_filename: false,
    use_filename: true,
    overwrite: true,
  };

  if (publicId) {
    option.public_id = publicId;
  }
  const result = await cloudinary.uploader.upload(filePath, option);
  return result.secure_url;
};

exports.getPublicId = (url) => {
  const publicId = url.split("/");

  return publicId[publicId.length - 1].split(".")[0];
};
