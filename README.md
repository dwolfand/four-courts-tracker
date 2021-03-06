# Four Courts Tracker

Designed to let you know when friends are going to be at Four Courts. Built using static client assets with a serverless backend. Authentication and calendar integration using Auth0 and Google Calendar API respectively.

### Demo application is at [https://dwolfand.github.io/four-courts-tracker/](https://dwolfand.github.io/four-courts-tracker/)

## Quick start

1. Make sure you have Node 8.10 installed along with yarn as well as AWS CLI.
### Client Setup
1. You can run a local web server for the static assets by using `yarn startClient`
1. You can deploy the client folder by using `yarn deployClient`

### Server Setup
1. You need to have a [`secrets.json`](#other-details) file (example below). Also make sure that you are logged into your AWS account via the CLI tool.
1. Before you can run aything locally, make sure to run `yarn initServer` which will initialize a local in-memory dynamodb instance. Then, once the server is running (using the command in the next step), you will need to run `yarn setupDynamo` which will create and seed the table.
1. To run the server you can use `yarn startServer`. Alternatively, you can locally invoke a single function using `yarn sls invoke local -f getEvents`. 
1. To deploy the server, use `yarn deployServer`.

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
