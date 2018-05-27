const {getUserTokens, getUser} = require('./api/auth0');
const {getGoogleEvents} = require('./api/googleApi');
const {getTokenCache, updateTokenCache} = require('./api/tokenCache');
const Promise = require("bluebird");
const moment = require('moment');

// Set in `enviroment` of serverless.yml
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

module.exports.updateUser = async (event, context, callback) => {
  console.log("whats the event", event);
  const body = event && event.body ? JSON.parse(event.body) : {};
  let user, isNewUser;
  if (body.email) {
    user = await getUser(body.email);
    const tokenCache = await getTokenCache();
    isNewUser = !tokenCache[body.email];
    const cachedUser = isNewUser ? {
      email: body.email,
      isDeleted: false,
      token: {}
    } : tokenCache[body.email];
    console.log('previous user entry', cachedUser);
    if (user) {
      if (user.identities[0].access_token)
        cachedUser.token.access_token = user.identities[0].access_token;
      if (user.identities[0].refresh_token)
        cachedUser.token.refresh_token = user.identities[0].refresh_token;
      cachedUser.isDeleted = false;
      console.log('updating to new user', cachedUser);
      await updateTokenCache(cachedUser);
    }
  }
  return {
    statusCode: 200,
    headers: {
      /* Required for CORS support to work */
      "Access-Control-Allow-Origin": "*",
      /* Required for cookies, authorization headers with HTTPS */
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({isNewUser: Boolean(isNewUser && user)}),
  };
}

module.exports.removeUser = async (event, context, callback) => {
  //TODO: Need to implement user removal
}

// Get events
module.exports.getEvents = async (event, context, callback) => {
  let userTokens;
  const tokenCache = await getTokenCache();
  userTokens = Object.values(tokenCache);
  // userTokens = await getUserTokens();

  const eventPromises = [];
  const eventResults = [];

  userTokens.map((user) => {
    if (typeof user !== 'object' || !user.token || !user.email)
      return;
    eventPromises.push(
      getGoogleEvents({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirecUri: 'https://four-courts-tracker.auth0.com/login/callback'
      }, user.token)
      .then((events) => {
        console.log(`User info for ${user.email}`)
        if (events && events.length >= 0) {
          eventResults.push({
            email: user.email,
            events: events,
          })
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