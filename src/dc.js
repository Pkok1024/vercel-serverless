import fetch from 'node-fetch';
import FormData from 'form-data';
import { fromBuffer } from 'file-type';
import fs from 'fs/promises'; // Use fs/promises for promises-based file operations

async function uploadFileToDiscord(fileBuffer) {
  // Detect file type and extension
  const { mime, ext } = await fromBuffer(fileBuffer);

  const formData = new FormData();

  // Append file to form data
  formData.append('files', fileBuffer, { contentType: mime, filename: `MUFAR_1227.${ext}` });

  // Add your Discord API endpoint and headers
  const discordEndpoint = 'https://discord.com/api/v9/channels/1180682772487098549/messages';
  const headers = {
    Authorization: 'Bot MTE4MDU0MDQzNDA5OTk5ODgyMA.GAlVm4.6IG4KO_wSdC6Mxen32zpkIndW1jdn2-UeAwEro',
  };

  // Request to Discord
  const response = await fetch(discordEndpoint, {
    method: 'POST',
    headers: { ...headers, ...formData.getHeaders() },
    body: formData,
  }).then((res) => res.json());

  return response;
}

export { uploadFileToDiscord };
