module.exports = {
  "apps": [
    {
      "name": "professional-website",
      "script": "professional-website/server.js",
      "instances": 1,
      "env": {
        "NODE_ENV": "production",
        "PORT": 3003
      },
      "env_production": {
        "NODE_ENV": "production",
        "PORT": 3003
      }
    },
    {
      "name": "testnet-dashboard",
      "script": "simple-testnet-dashboard.js",
      "instances": 1,
      "env": {
        "NODE_ENV": "production",
        "PORT": 3006
      },
      "env_production": {
        "NODE_ENV": "production",
        "PORT": 3006
      }
    },
    {
      "name": "beast-mode-bot",
      "script": "src/index.js",
      "instances": 1,
      "env": {
        "NODE_ENV": "production"
      },
      "env_production": {
        "NODE_ENV": "production"
      }
    }
  ]
}; 