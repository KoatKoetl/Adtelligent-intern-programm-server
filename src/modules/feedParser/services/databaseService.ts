import type { FastifyInstance } from "fastify";
import type { DatabaseResult, RSSItem } from "../types/types";

export async function getNewsFromDatabase(
	fastify: FastifyInstance,
): Promise<DatabaseResult> {
	try {
		const newsFromDb = await fastify.prisma.news.findMany({
			orderBy: {
				pubDate: "desc",
			},
		});

		const news = newsFromDb.map((item) => ({
			...item,
			pubDate: item.pubDate ? item.pubDate.toISOString() : null,
		}));

		const total = news.length;

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

export async function saveNewsToDatabase(
	fastify: FastifyInstance,
	feedItems: RSSItem[],
): Promise<number> {
	let newItemsCount = 0;

	for (const item of feedItems) {
		try {
			const existingNews = await fastify.prisma.news.findFirst({
				where: {
					OR: [{ link: item.link }, { guid: item.guid || item.link }],
				},
			});

			if (existingNews) {
				continue;
			}

			await fastify.prisma.news.create({
				data: {
					title: item.title || "Untitled",
					link: item.link || "",
					description:
						item.contentSnippet || item.content || item.summary || null,
					pubDate: item.pubDate ? new Date(item.pubDate) : null,
					author: item.creator || item.author || null,
					guid: item.guid || item.link || null,
				},
			});

			newItemsCount++;
			fastify.log.info(`Saved news item: ${item.title}`);
		} catch (error) {
			fastify.log.error(`Failed to save news item: ${item.title}`, error);
		}
	}

	return newItemsCount;
}

export async function isDataFresh(
	fastify: FastifyInstance,
	maxAgeHours: number = 24,
) {
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
