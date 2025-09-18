import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { schema } from "../schema/getData.schema";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	const _route: FastifyInstance =
		fastify.withTypeProvider<JsonSchemaToTsProvider>();

	fastify.get(
		"/feed",
		{ schema: schema },
		async (_request: FastifyRequest, reply: FastifyReply) => {
			reply.send({ hello: "feed" });
		},
	);
}
