// index.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(helmet());
app.use(morgan('tiny'));

// Basic rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
}));

// Serve static UI
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${id}${ext}`);
  }
});

// Accept only PDFs (check both mimetype and extension)
const fileFilter = (req, file, cb) => {
  const allowedMime = file.mimetype === 'application/pdf';
  const ext = path.extname(file.originalname).toLowerCase() === '.pdf';
  if (allowedMime && ext) return cb(null, true);
  const err = new Error('Only PDF files are allowed.');
  err.code = 'BAD_FILE_TYPE';
  return cb(err, false);
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter
}).single('resume');

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    // Multer-specific errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'File too large. Max 2MB allowed.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    // Custom file type error
    if (err && err.code === 'BAD_FILE_TYPE') {
      return res.status(400).json({ success: false, message: 'Only PDF files are allowed.' });
    }

    // Other errors
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ success: false, message: 'Server error during file upload.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Success
    return res.json({
      success: true,
      message: 'Resume uploaded successfully.',
      filename: req.file.filename,
      size: req.file.size
    });
  });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
