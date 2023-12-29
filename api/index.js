import express from 'express';
import multer from 'multer';
import { uploadFileToDiscord } from './dc';
import fs from 'fs';

const app = express();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

app.get('/document', (req, res) => {
  const apiDocContent = fs.readFileSync('api-doc.html', 'utf8');
  res.send(apiDocContent);
});

app.get('/', (req, res) => {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  res.send(htmlContent);
});

app.get('/api', (req, res) => {
  res.end(`Hello! Serverless`);
});

app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
});

app.post('/api/upload-to-discord', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds the 10MB limit.' });
    }
    const fileBuffer = req.file.buffer;

    const result = await uploadFileToDiscord(fileBuffer);

    const cleanedFileUrl = result.attachments[0].url.replace(/\?.*$/, '');

    const discordResponse = {
      message: 'File uploaded successfully.',
      author: `${result.author.username}`,
      responseCode: 200,
      fileUrl: cleanedFileUrl,
    };

    console.log(`Notification:
      ${discordResponse.message}
      ${discordResponse.author}
      Response Code: ${discordResponse.responseCode}
      File URL: ${discordResponse.fileUrl}`);

    res.status(200).json(discordResponse);
  } catch (error) {
    console.error('Error uploading to Discord:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default app;
