import express from "express";
import multer from 'multer';
import axios from "axios"
import FormData from 'form-data';
const app = express();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
app.get('/api', (req, res) => {
	res.end(`Hello! Serverless`);
});

app.get('/api/item/:slug', (req, res) => {
	const { slug } = req.params;
	res.end(`Item: ${slug}`);
});
app.post('/api/upload-to-discord', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(400).json({ error: 'File size exceeds the 10MB limit.' });
  }

  const fileBuffer = req.file.buffer;
  const formData = new FormData();
  formData.append('file', fileBuffer, { filename: req.file.originalname });

  try {
    const result = await axios.post('https://dollar.bivat22407.repl.co/api/upload-to-discord', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const cleanedFileUrl = result.data.attachments[0].url.replace(/\?.*$/, '');
    const discordResponse = {
      message: 'File uploaded successfully.',
      author: `${result.data.author.username}`,
      responseCode: 200,
      fileUrl: cleanedFileUrl,
    };

    res.status(200).json(discordResponse);
  } catch (error) {
    console.error('Error uploading file to Discord:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default app;
