module.exports = {
    apps: [{
        name: "server",
        script: "./dist/server.js",
        instances: 1,
        exec_mode: "fork",
        env: {
            NODE_ENV: "production",
            PORT: process.env.PORT
        }
    }]
};
