import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { schema } from "../schema/getData.schema";
import { getFeedData } from "../services/handleFeed";
import type { FeedQuery } from "../types/types";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	const route: FastifyInstance =
		fastify.withTypeProvider<JsonSchemaToTsProvider>();
	const DEFAULT_FEED_URL = fastify.config.DEFAULT_FEED_URL;

	route.get<{ Querystring: FeedQuery }>(
		"/feed",
		{ schema: schema },
		async (
			request: FastifyRequest<{ Querystring: FeedQuery }>,
			reply: FastifyReply,
		) => {
			try {
				const { url = DEFAULT_FEED_URL, force = "0" } = request.query;

				const feedData = await getFeedData(fastify, url, force);

				reply.send(feedData);
			} catch (error) {
				fastify.log.error("Feed endpoint error:", error);
				reply.internalServerError(error);
			}
		},
	);
}
