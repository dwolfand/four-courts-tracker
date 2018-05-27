const jwt = require('jsonwebtoken');
const request = require("request-promise");
const {getGoogleEvents} = require('./googleApi');
const Promise = require("bluebird");

// Set in `enviroment` of serverless.yml
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {}
  authResponse.principalId = principalId
  if (effect && resource) {
    const policyDocument = {}
    policyDocument.Version = '2012-10-17'
    policyDocument.Statement = []
    const statementOne = {}
    statementOne.Action = 'execute-api:Invoke'
    statementOne.Effect = effect
    statementOne.Resource = resource
    policyDocument.Statement[0] = statementOne
    authResponse.policyDocument = policyDocument
  }
  return authResponse
}

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.auth = (event, context, callback) => {
  console.log('event', event)
  if (!event.authorizationToken) {
    return callback('Unauthorized')
  }

  const tokenParts = event.authorizationToken.split(' ')
  const tokenValue = tokenParts[1]

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    return callback('Unauthorized')
  }
  const options = {
    audience: AUTH0_CLIENT_ID,
  }
  // decode base64 secret. ref: http://bit.ly/2hA6CrO
  const secret = new Buffer.from(AUTH0_CLIENT_SECRET, 'base64')
  try {
    jwt.verify(tokenValue, secret, options, (verifyError, decoded) => {
      if (verifyError) {
        console.log('verifyError', verifyError)
        // 401 Unauthorized
        console.log(`Token invalid. ${verifyError}`)
        return callback('Unauthorized')
      }
      // is custom authorizer function
      console.log('valid from customAuthorizer', decoded)
      return callback(null, generatePolicy(decoded.sub, 'Allow', event.methodArn))
    })
   } catch (err) {
    console.log('catch error. Invalid token', err)
    return callback('Unauthorized')
  }
}

// Public API
module.exports.publicEndpoint = (event, context, callback) => {
  return callback(null, {
    statusCode: 200,
    headers: {
      /* Required for CORS support to work */
      "Access-Control-Allow-Origin": "*",
      /* Required for cookies, authorization headers with HTTPS */
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({
      message: 'Hi ⊂◉‿◉つ from Public API',
    }),
  })
}

// Private API
module.exports.privateEndpoint = (event, context, callback) => {
  return callback(null, {
    statusCode: 200,
    headers: {
      /* Required for CORS support to work */
      "Access-Control-Allow-Origin": "*",
      /* Required for cookies, authorization headers with HTTPS */
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({
      message: 'Hi ⊂◉‿◉つ from Private API. Only logged in users can see this',
    }),
  })
}


// Get events
module.exports.getEvents = async (event, context, callback) => {
  const auth0credResponse = await request({
    method: 'POST',
    url: 'https://four-courts-tracker.auth0.com/oauth/token',
    headers: { 'content-type': 'application/json' },
    body: `{"client_id":"${AUTH0_CLIENT_ID}","client_secret":"${AUTH0_CLIENT_SECRET}","audience":"https://four-courts-tracker.auth0.com/api/v2/","grant_type":"client_credentials"}`,
  })
  const auth0creds = JSON.parse(auth0credResponse);
  console.log('whats the creds?', JSON.stringify(auth0creds, null, ' '));

  const auth0userResponse = await request({
    method: 'GET',
    url: 'https://four-courts-tracker.auth0.com/api/v2/users',
    // auth: {bearer: auth0creds.access_token},
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${auth0creds.access_token}`,
    },
  });
  const auth0users = JSON.parse(auth0userResponse);
  console.log('whats the users?', JSON.stringify(auth0users, null, ' '));

  const eventPromises = [];
  const eventResults = [];

  auth0users.map((user) => {
    eventPromises.push(
      getGoogleEvents({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirecUri: 'https://four-courts-tracker.auth0.com/login/callback'
      }, {
        "access_token": user.identities[0].access_token,
        "refresh_token": user.identities[0].refresh_token,
      })
      .then((events) => {
        eventResults.push({
          email: user.email,
          events: events,
        })
        console.log(`User info for ${user.email}`)
        if (events.length) {
          console.log('Upcoming events:');
          events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            console.log(`${start} - ${event.summary}`);
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
      body: JSON.stringify({
        message: 'Hi ⊂◉‿◉つ from Private API. Only logged in users can see this',
        eventResults,
      }),
    };
  });
}