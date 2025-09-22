import type { FastifyInstance } from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import fp from "fastify-plugin";

const pluginName = "fastify-bcrypt-plugin";

export default fp(async (fastify: FastifyInstance) => {
	fastify.register(fastifyBcrypt, {
		saltWorkFactor: 10,
	});

	fastify.pluginLoaded(pluginName);
});
