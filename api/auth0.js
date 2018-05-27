const request = require("request-promise");

// Set in `enviroment` of serverless.yml
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET

module.exports.getUserTokens = async function getUserTokens() {
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
    return auth0users.map((user) => {
      /* Google only sends a refresh token the first time a user authenticates
         with a service, so it is very important that we cache this token since
         any subsequent logins will wipe out the refresh_token and we wont be
         able to update the calendar */
      if (user.identities[0].refresh_token){
        return {
          email: user.email,
          token: {
            "access_token": user.identities[0].access_token,
            "refresh_token": user.identities[0].refresh_token,
          },
        };
      }
      else {
        return {email: user.email};
      }
    })
  };