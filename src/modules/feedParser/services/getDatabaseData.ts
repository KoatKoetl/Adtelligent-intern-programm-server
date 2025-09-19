import type { FastifyInstance } from "fastify/types/instance";
import type { DatabaseResult } from "../types/types";

async function getNewsFromDatabase(
	fastify: FastifyInstance,
): Promise<DatabaseResult> {
	try {
		const news = await fastify.prisma.news.findMany({
			orderBy: {
				pubDate: "desc",
			},
		});

		const total = await fastify.prisma.news.count();

		return {
			items: news,
			total,
		};
	} catch (error) {
		fastify.log.error("Database error:", error);
		throw fastify.httpErrors.internalServerError(
			"Failed to fetch news from database",
		);
	}
}

export default getNewsFromDatabase;
