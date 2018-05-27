const {google} = require('googleapis');

const timeMin = (new Date()).toISOString();
let timeMax = new Date();
timeMax.setDate(timeMax.getDate() + 60);
timeMax = timeMax.toISOString();

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
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

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @return {function} if error in reading credentials.json asks for a new one.
 */
module.exports.getGoogleEvents = function getGoogleEvents(credentials, token, callback) {
  const oAuth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirectUri);

  oAuth2Client.setCredentials(token);
  return listEvents(oAuth2Client);
}
