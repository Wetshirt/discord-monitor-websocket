require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const urlModule = require('url');
const { google } = require('googleapis');
const SCOPE = ['https://www.googleapis.com/auth/drive'];

const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Auth Google Drive
const jwtClient = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  null,
  GOOGLE_PRIVATE_KEY,
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

async function getUploadFolder(folderName, description) {
  // List folders with mimeType 'application/vnd.google-apps.folder'
  const response = await drive.files.list({
    q: `'${DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
    fields: 'files(id, name)',
  });

  // folder exist
  if (response.data.files.length !== 0) {
    const folderId = response.data.files[0].id;
    await drive.files.update({
      fileId: folderId,
      resource: { description }
    });
    console.log('[Google Drive]: Folder Exist');
    return folderId;
  } else {
    // Define folder metadata
    const fileMetadata = {
      'name': folderName,
      'description': description,
      'mimeType': 'application/vnd.google-apps.folder',
      'parents': [DRIVE_FOLDER_ID]
    };
    // Create the folder
    const response = await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    });
    console.log('[Google Drive]: Create Folder');
    return response.data.id;
  }
}

async function uploadFile(filePath, uploadFolder) {
  const fileName = path.basename(filePath);
  const fileMetaData = {
    name: fileName,
    parents: [uploadFolder] // A folder ID to which file will get uploaded
  };

  try {
    await drive.files.create({
      resource: fileMetaData,
      media: {
        body: fs.createReadStream(filePath), // files that will get uploaded
      },
      fields: 'id'
    });
    console.log('[Google Drive]: Upload Success');
  } catch (e) {
    console.log('[Google Drive]: Upload Error', e);
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

async function SaveGoogleDrive(url, folderName, description) {
  const filePath = await getFilePath(url);
  // download from cdn
  await downloadFile(url, filePath);
  // upload to drive
  const uploadFolderId = await getUploadFolder(folderName, description);
  await uploadFile(filePath, uploadFolderId);
  // release file
  await deleteFile(filePath);
}

module.exports = SaveGoogleDrive;
