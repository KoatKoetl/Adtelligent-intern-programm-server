import fastifyCookie from "@fastify/cookie";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

const pluginName = "fastify-cookie-plugin";

export default fp(async (fastify: FastifyInstance) => {
	fastify.register(fastifyCookie);

	fastify.pluginLoaded(pluginName);
});
