

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve('public/uploads/vehicle_images');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save to /public/uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext); // Save with unique name
  }
});

const upload = multer({ storage });

module.exports = upload;
