import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { schema } from "../schema/getData.schema";
import { getFeedData } from "../services/handleFeed";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.get("/feed", { schema: schema }, async (request, reply) => {
		try {
			const { url = fastify.config.DEFAULT_FEED_URL, force = "0" } =
				request.query;

			const feedData = await getFeedData(fastify, url, force);

			reply.send(feedData);
		} catch (error) {
			fastify.log.error("Feed endpoint error:", error);
			reply.internalServerError(error);
		}
	});
}
