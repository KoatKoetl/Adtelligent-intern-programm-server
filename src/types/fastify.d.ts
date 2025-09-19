import type { Config } from "../config/schema";
import type { PrismaClient } from "../prisma/generated/prisma/client";

declare module "fastify" {
	interface FastifyInstance {
		config: Config;
		prisma: PrismaClient;
		pluginLoaded: (pluginName: string) => void;
	}
}
