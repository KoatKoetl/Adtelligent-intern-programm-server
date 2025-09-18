import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { schema } from "../schema/getData.schema";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
  const route: FastifyInstance =
    fastify.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/feed",
    { schema: schema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      reply.send({ hello: "feed" });
    }
  );
}
