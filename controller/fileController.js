const cloudinary = require('../config/cloudinary');
const path = require('path');


const uploadToCloudinary = (fileBuffer, folder, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folder,
        public_id: fileName, 
        resource_type: 'auto' 
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};






const fileController = {
  


  uploadImages: async (req, res) => {
    try {
      // 1. Kiểm tra file từ middleware
      const files = req.files;
      if (!files || files.length === 0) {
        throw new Error("No files were uploaded.");
      }

      console.log(`Received upload request from user: ${req.userId}`);
      
      const folder = process.env.CLOUDINARY_FOLDER_NAME || 'MERN-BE';
      const uploadPromises = [];


      for (const file of files) {
        // Lấy tên file gốc không có phần mở rộng (ví dụ: "my.photo")
        const originalName = path.parse(file.originalname).name;

        // TẠO PUBLIC_ID DUY NHẤT để chống ghi đè file
        const uniquePublicId = `${originalName}-${Date.now()}`;

        // Thêm promise vào mảng
        uploadPromises.push(uploadToCloudinary(file.buffer, folder, uniquePublicId));
      }

      const uploadResults = await Promise.all(uploadPromises);

      const fileResponses = uploadResults.map((result, index) => ({
        publicId: result.public_id,
        fileName: req.files[index].originalname,
        imageUrl: result.secure_url
      }));

      console.log("upload files successfully:", fileResponses);

      res.status(200).json({
        code: 200,
        message: "Files uploaded successfully",
        result: fileResponses,
        success: true
      });

    } catch (err) {
      console.error("File Controller ERROR:", {
        message: err.message,
        stack: err.stack
      });
      
      res.status(400).json({
        message: err.message || "An error occurred while uploading files",
        error: true,
        success: false
      });
    }
  }


};




module.exports = fileController;