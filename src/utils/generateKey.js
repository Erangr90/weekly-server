"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecret = generateSecret;
const crypto_1 = require("crypto");
function generateSecret(length = 64) {
    return (0, crypto_1.randomBytes)(length).toString("hex");
}
