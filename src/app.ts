import { join } from "node:path";
import AutoLoad from "@fastify/autoload";
import Fastify, { type FastifyServerOptions } from "fastify";
import configPlugin from "./config";
import prismaPlugin from "./prisma";

export type AppOptions = Partial<FastifyServerOptions>;

const pinoPrettyConfig = {
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			translateTime: "HH:MM:ss Z",
			ignore: "pid,hostname",
		},
	},
};

async function buildApp(options: AppOptions = {}) {
	const fastify = Fastify({
		logger: pinoPrettyConfig,
	});

	await fastify.register(configPlugin);
	await fastify.register(prismaPlugin);

	try {
		fastify.decorate("pluginLoaded", (pluginName: string) => {
			fastify.log.info(`Plugin loaded: ${pluginName}`);
		});

		fastify.log.info("Starting to load plugins");
		await fastify.register(AutoLoad, {
			dir: join(__dirname, "plugins"),
			options,
			ignorePattern: /^((?!plugin).)*$/,
		});
		fastify.log.info("Plugins loaded successfully");

		fastify.log.info("Starting to load routes");
		await fastify.register(AutoLoad, {
			dir: join(__dirname, "modules"),
			options: {
				prefix: "/api",
			},
			dirNameRoutePrefix: false,
			ignorePattern: /.*(?<!route)\.(ts|js)$/,
		});
		fastify.log.info("Routes loaded successfully");
	} catch (error) {
		fastify.log.error("Error in autoload:", error);
		throw error;
	}

	return fastify;
}

export default buildApp;
