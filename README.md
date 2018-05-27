# Four Courts Tracker

Designed to let you know when friends are going to be at Four Courts. Built using static client assets with a serverless backend.

## Quick start

1. Make sure you have Node 8.10 installed along with yarn
1. You can run the local server for the static assets by using `yarn start`
1. For server deploys or local invocation, you need to have a secrets.json file with the necessary Auth0 and GoogleAPI creds. Also make sure that you have your AWS credentials in you env vars or in `~/.aws/credentials`
1. To deploy the server use `yarn deploy` or you can locally invoke the function using `yarn sls invoke local -f getEvents`

### Demo application is at https://dwolfand.github.io/four-courts-tracker/client/
