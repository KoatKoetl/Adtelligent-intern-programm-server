import fp from "fastify-plugin";
import sensible from "@fastify/sensible";
import { FastifyInstance } from "fastify";

const pluginName = "sensible-plugin";

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(sensible);

  fastify.pluginLoaded(pluginName);
});
