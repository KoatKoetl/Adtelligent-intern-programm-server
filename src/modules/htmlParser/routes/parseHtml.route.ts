import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { parseArticleSchema } from "../schema/schema";
import { parseArticle } from "../service/htmlParse";

export default async function articleRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.get(
		"/api/feed/article",
		{ schema: parseArticleSchema },
		async (request, reply) => {
			const { url } = request.query;

			try {
				const parsedData = await parseArticle(fastify, url);
				reply.send(parsedData);
			} catch (error) {
				fastify.log.error("Feed endpoint error:", error);
				reply.internalServerError(error);
			}
		},
	);
}
