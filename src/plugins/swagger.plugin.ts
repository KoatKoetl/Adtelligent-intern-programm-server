import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

const pluginName = "swagger-plugin";

export default fp(
	async (fastify: FastifyInstance) => {
		fastify.register(swagger, {
			openapi: {
				info: {
					title: "Server API",
					description: "API documentation generated with @fastify/swagger.",
					version: "1.0.0",
				},
			},
		});

		fastify.register(swaggerUi, {
			routePrefix: "/documentation",
			uiConfig: {
				docExpansion: "list",
				deepLinking: false,
			},
		});

		fastify.ready(() => {
			fastify.log.info("Swagger documentation successfully generated.");
		});

		fastify.pluginLoaded(pluginName);
	},
	{
		name: pluginName,
	},
);
