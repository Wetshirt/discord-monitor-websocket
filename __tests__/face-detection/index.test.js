require('dotenv').config();
const { google } = require('googleapis');
const isContainFace = require('../../lib/face-detection');
const _ = require('lodash');

const SCOPE = ['https://www.googleapis.com/auth/drive'];
const FOLDER_ID = process.env.TEST_FACE_FOLDER;
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

describe('test face-detection', () => {
  it('face images', async () => {
    // get images url
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents`,
      fields: 'files(name, webContentLink)',
    });

    const files = _.get(response, 'data.files');
    for (const file of files) {
      const detect = await isContainFace(file.webContentLink);
      if (file.name.startsWith('true')) {
        expect(detect).toBe(true);
      }
      else if (file.name.startsWith('false')) {
        expect(detect).toBe(false);
      }
    }

  }, 15000);
});
