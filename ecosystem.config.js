module.exports = {
    apps: [
        {
            name: "server",
            script: "dist/index.js",
            instances: 1, // or 'max' for cluster mode if desired
            exec_mode: "fork", // or 'cluster' if you're comfortable managing it
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
