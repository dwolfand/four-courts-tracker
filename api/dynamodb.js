const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let options = {
    maxRetries: 3,
    httpOptions: {
        timeout: 4000,
        connectTimeout: 1000,
    },
};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  };
}

const client = new AWS.DynamoDB.DocumentClient(options);

module.exports = client;