# Four Courts Tracker

Designed to let you know when friends are going to be at Four Courts. Built using static client assets with a serverless backend.

### Demo application is at https://dwolfand.github.io/four-courts-tracker/client/

## Quick start

1. Make sure you have Node 8.10 installed along with yarn as well as AWS CLI.
1. You can run the local server for the static assets by using `yarn start`
1. For server deploys or local invocation, you need to have a [`secrets.json`](#other-details) file. Also make sure that you are logged into your AWS account via the CLI tool.
1. To deploy the server use `yarn deploy` or you can locally invoke the function using `yarn sls invoke local -f getEvents`

## Other Details
Your `secrets.json` file should look like this
```
{
  "AUTH0_CLIENT_ID": "*****",
  "AUTH0_CLIENT_SECRET": "*****",
  "GOOGLE_CLIENT_ID": "*****",
  "GOOGLE_CLIENT_SECRET": "*****"
}
```
