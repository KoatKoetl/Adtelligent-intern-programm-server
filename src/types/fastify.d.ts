import type { PrismaClient } from "../../prisma/generated/prisma/client";
import type { Config } from "../config/schema";

declare module "fastify" {
	interface FastifyInstance {
		config: Config;
		pluginLoaded: (pluginName: string) => void;
		prisma: PrismaClient;
	}
}
