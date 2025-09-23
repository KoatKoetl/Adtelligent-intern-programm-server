import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

const pluginName = "fastify-jwt-plugin";

export default fp(async (fastify: FastifyInstance) => {
	fastify.register(fastifyJwt, {
		secret: fastify.config.JWT_SECRET,
		cookie: {
			cookieName: "token",
			signed: false,
		},
	});

	fastify.pluginLoaded(pluginName);
});
