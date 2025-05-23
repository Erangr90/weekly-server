import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

const connectToDb = async () => {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error(error);
  }
};

export { prisma, connectToDb };
