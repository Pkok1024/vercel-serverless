import express from "express";
import multer from 'multer';
import { uploadFileToDiscord } from '../src/dc';
import fs from 'fs';

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
    const result = await uploadFileToDiscord(fileBuffer);
    const cleanedFileUrl = result.attachments[0].url.replace(/\?.*$/, '');
    const discordResponse = {
      message: 'File uploaded successfully.',
      author: `${result.author.username}`,
      responseCode: 200,
      fileUrl: cleanedFileUrl,
    };
    res.status(200).json(discordResponse);
});
export default app;
