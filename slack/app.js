const { App } = require('@slack/bolt');
require('dotenv').config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // Use Socket Mode for local testing and firewall bypass
  appToken: process.env.SLACK_APP_TOKEN
});

module.exports = app;
