import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { PrismaClient } from "../prisma/generated/prisma/client";

const pluginName = "prisma-plugin";

export default fp(
	async (fastify: FastifyInstance) => {
		const prisma = new PrismaClient();

		try {
			fastify.log.info("Connecting Prisma to the database...");
			await prisma.$connect();
			await prisma.news.findFirst();
			fastify.log.info("Prisma connected to the database successfully.");
		} catch (error) {
			fastify.log.error("Failed to connect to the database.", error);
			throw error;
		}

		fastify.decorate("prisma", prisma);

		fastify.addHook("onClose", async (instance) => {
			fastify.log.info("Disconnecting Prisma from the database...");
			await instance.prisma.$disconnect();
			fastify.log.info("Prisma disconnected successfully.");
		});
	},
	{
		name: pluginName,
	},
);
