const {google} = require('googleapis');

const timeMin = (new Date()).toISOString();
let timeMax = new Date();
timeMax.setDate(timeMax.getDate() + 90);
timeMax = timeMax.toISOString();

listEvents =  function listEvents(auth) {
  console.log(timeMax);
  const calendar = google.calendar({version: 'v3', auth});
  return calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    q: 'four courts',
    singleEvents: true,
    orderBy: 'startTime',
  })
  .then((response) => response.data.items);
}

module.exports.getGoogleEvents = function getGoogleEvents(credentials, token, callback) {
  const oAuth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirectUri);

  oAuth2Client.setCredentials(token);
  return listEvents(oAuth2Client);
}

