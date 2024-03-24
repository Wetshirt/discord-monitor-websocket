require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const urlModule = require('url');
const { google } = require('googleapis');
const apikeys = require('../serviceAccountKey.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

// Auth Google Drive
const jwtClient = new google.auth.JWT(
  apikeys.client_email,
  null,
  apikeys.private_key,
  SCOPE
);
jwtClient.authorize();
const drive = google.drive({ version: 'v3', auth: jwtClient });

async function getFilePath(url) {
  const directory = 'downloads';
  try {
    // check if folder already exist
    await fs.promises.stat(directory);
    console.log('Directory exists:', directory);
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await fs.promises.mkdir(directory, { recursive: true });
        console.log('Directory created:', directory);
      } catch (error) {
        console.error('Error creating directory:', error);
      }
    } else {
      console.error('Error checking directory:', error);
    }
  }
  const urlInfo = urlModule.parse(url);
  return path.join('downloads', path.basename(urlInfo.pathname));
}

async function downloadFile(url, filePath) {
  try {
    // Fetch the file from the URL
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    // Create a writable stream and pipe the response data stream into it
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Return a Promise to handle when the download finishes
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log('File downloaded successfully.');
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

async function uploadFile(filePath) {
  const fileName = path.basename(filePath)
  const fileMetaData = {
    name: fileName,
    parents: [DRIVE_FOLDER_ID] // A folder ID to which file will get uploaded
  };
  
  try {
    await drive.files.create({
      resource: fileMetaData,
      media: {
        body: fs.createReadStream(filePath), // files that will get uploaded
      },
      fields: 'id'
    });
    
  } catch (e) {
    console.log('[Upload File Error]', e);
  }
}

async function deleteFile(filePath) {
  try {
    // 使用 fs.promises.unlink 方法删除文件
    await fs.promises.unlink(filePath);
    console.log('File deleted successfully.');
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

async function SaveGoogleDrive(url) { 
  const filePath = await getFilePath(url);
  // download from cdn
  await downloadFile(url, filePath);
  // upload to drive
  await uploadFile(filePath);
  // release file
  await deleteFile(filePath);
}

module.exports = SaveGoogleDrive;
