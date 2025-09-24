import type { FastifyInstance } from "fastify";
import { PrismaClient } from "../../../prisma/generated/prisma/client";

export async function checkDbConnection(fastify: FastifyInstance) {
	const prisma = new PrismaClient();

	try {
		fastify.log.info("Trying to connect to the database...");
		await prisma.$connect();
		await prisma.news.findFirst();
		fastify.log.info("Connected to the database successfully.");
		return { db_status: "ok" };
	} catch (error) {
		fastify.log.error("Failed to connect to the database.", error);
		throw error;
	}
}
