const {getUserTokens} = require('./api/auth0')
const {getGoogleEvents} = require('./api/googleApi');
const Promise = require("bluebird");
const moment = require('moment');

// Set in `enviroment` of serverless.yml
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Get events
module.exports.getEvents = async (event, context, callback) => {
  const userTokens = await getUserTokens();

  const eventPromises = [];
  const eventResults = [];

  userTokens.map((user) => {
    if (!user.token)
      return;
    eventPromises.push(
      getGoogleEvents({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirecUri: 'https://four-courts-tracker.auth0.com/login/callback'
      }, user.token)
      .then((events) => {
        eventResults.push({
          email: user.email,
          events: events,
        })
        console.log(`User info for ${user.email}`)
        if (events.length) {
          events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            console.log(`${moment(start)} - ${event.summary}`);
          });
        } else {
          console.log('No upcoming events found.');
        };
      })
    );
  });

  return Promise.all(eventPromises)
  .then(() => {
    return {
      statusCode: 200,
      headers: {
        /* Required for CORS support to work */
        "Access-Control-Allow-Origin": "*",
        /* Required for cookies, authorization headers with HTTPS */
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({eventResults}),
    };
  });
}