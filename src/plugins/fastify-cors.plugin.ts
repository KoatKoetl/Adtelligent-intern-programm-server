import type { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fp from "fastify-plugin";

const pluginName = "fastify-cors-plugin";

export default fp(async (fastify: FastifyInstance) => {
	fastify.register(fastifyCors, {
		origin: 'http://localhost:5173',
		credentials: true,
	});

	fastify.pluginLoaded(pluginName);
});
