const app = require('./slack/app');
const { registerListeners } = require('./slack/listeners');
require('dotenv').config();

const port = process.env.PORT || 3000;

// Register listeners
registerListeners(app);

(async () => {
  // Start the Slack Bolt app
  try {
    await app.start(port);
    console.log(`⚡️ ClinicFlow Slack Agent is running on port ${port}!`);
  } catch (error) {
    console.error('Failed to start ClinicFlow app:', error);
    process.exit(1);
  }
})();
