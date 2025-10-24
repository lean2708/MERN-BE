const multer = require('multer');


const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Chấp nhận file
  } else {
    console.warn(`[FileFilter] Rejecting file: ${file.originalname}. Invalid MIME type.`);
    cb(new Error('Invalid file type. Only image files are allowed.'), false)
  }
};


const limits = {
  fileSize: 1024 * 1024 * 50 
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});



module.exports = upload.array('files', 10);