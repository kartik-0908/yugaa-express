const dotenv = require('dotenv');
const env = dotenv.config().parsed;

module.exports = {
  apps: [{
    name: "yugaa-express",
    script: "dist/index.js",
    env: env
  }]
};