import sensible from "@fastify/sensible";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

const pluginName = "sensible-plugin";

export default fp(async (fastify: FastifyInstance) => {
	fastify.register(sensible);

	fastify.pluginLoaded(pluginName);
});
