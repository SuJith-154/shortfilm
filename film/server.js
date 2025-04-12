// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.static('public'));

// Storage config
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.send({ filename: req.file.filename });
});


app.get('/video/:filename', (req, res) => {
  const videoPath = path.join(uploadDir, req.params.filename);
  fs.stat(videoPath, (err, stats) => {
    if (err || !stats.isFile()) return res.status(404).send('Video not found');

    const range = req.headers.range;
    if (!range) return res.status(416).send('Requires Range header');

    const videoSize = stats.size;
    const CHUNK_SIZE = 1 * 1e6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, headers);
    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
  });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
