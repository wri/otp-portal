module.exports = {
  apps : [{
    name: "otp-portal",
    script: "next",
    args: "start",
    cwd: "/var/www/otp-portal",
    watch: false,
    env: {
      NODE_ENV: "production",
      PORT: 5000
    }
  }]
};
