module.exports = {
  apps : [{
    name: "otp-portal",
    // Cluster mode forks node directly, so it cannot go through the yarn wrapper.
    // next start still reads PORT from env, exactly as the yarn script did.
    script: "node_modules/next/dist/bin/next",
    args: "start",
    cwd: "/var/www/otp-portal",
    exec_mode: "cluster",
    // renderToString is synchronous, so a single process serialises every render
    // and concurrent requests queue. Both hosts are 2 vCPU (t4g.large prod,
    // t4g.small staging) and share the box with postgres, rails and nginx, so
    // there is no headroom past 2 - set WEB_CONCURRENCY=1 on staging, where the
    // build runs in place against 2 GiB.
    instances: Number(process.env.WEB_CONCURRENCY) || 2,
    watch: false,
    env: {
      NODE_ENV: "production",
      PORT: 5000
    }
  }]
};
