import type { FastifyInstance } from "fastify";

async function isDataFresh(fastify: FastifyInstance, maxAgeHours: number = 24) {
	try {
		const latestNews = await fastify.prisma.news.findFirst({
			orderBy: {
				createdAt: "desc",
			},
			select: {
				createdAt: true,
			},
		});

		if (!latestNews) {
			return false;
		}

		const hoursSinceLastUpdate =
			(Date.now() - latestNews.createdAt.getTime()) / (1000 * 60 * 60);
		return hoursSinceLastUpdate < maxAgeHours;
	} catch (error) {
		fastify.log.error("Error checking data freshness:", error);
		return false;
	}
}

export default isDataFresh;
