"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDb = exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
exports.prisma = prisma;
const connectToDb = async () => {
    try {
        await prisma.$connect();
    }
    catch (error) {
        console.error(error);
    }
};
exports.connectToDb = connectToDb;
