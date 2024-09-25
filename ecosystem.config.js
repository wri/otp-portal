module.exports = {
  apps : [{
    name: "otp-portal",
    script: "yarn",
    args: "start",
    cwd: "/var/www/otp-portal",
    watch: false,
    env: {
      NODE_ENV: "production",
      PORT: 6000
    }
  }]
};
