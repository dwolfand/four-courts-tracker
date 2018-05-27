const {google} = require('googleapis');

let timeMin = new Date();
timeMin.setDate(timeMin.getDate() - 30);
timeMin = timeMin.toISOString();
let timeMax = new Date();
timeMax.setDate(timeMax.getDate() + 90);
timeMax = timeMax.toISOString();

listEvents =  function listEvents(auth, token) {
  const calendar = google.calendar({version: 'v3', auth});
  return calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    q: 'four courts',
    singleEvents: true,
    orderBy: 'startTime',
  })
  .then((response) => response.data.items)
  .catch((err) => {
    console.log('event list error for token:', token, err.message);
    return Promise.resolve();
  });
}

module.exports.getGoogleEvents = function getGoogleEvents(credentials, token, callback) {
  const oAuth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirectUri);

  oAuth2Client.setCredentials(token);
  return listEvents(oAuth2Client, token);
}

