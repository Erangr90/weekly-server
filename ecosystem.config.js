module.exports = {
    apps: [{
        name: "server",
        script: "./dist/index.js",
        instances: 1,
        exec_mode: "fork",
        env: {
            NODE_ENV: "production",
            PORT: process.env.PORT
        }
    }]
};
