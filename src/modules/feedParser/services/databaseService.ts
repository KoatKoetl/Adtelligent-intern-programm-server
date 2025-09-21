import type { FastifyInstance } from "fastify";
import type { RSSItem } from "../types/types";

export async function getNewsFromDatabase(fastify: FastifyInstance) {
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
	feedUrl: string,
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
					feedUrl: feedUrl || "",
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

export async function isFeedDataFresh(
	fastify: FastifyInstance,
	feedUrl: string,
	maxAgeHours: number = 24,
): Promise<boolean> {
	try {
		const latestFeedNews = await fastify.prisma.news.findFirst({
			where: {
				feedUrl: feedUrl,
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				createdAt: true,
			},
		});

		if (!latestFeedNews) {
			const feedType =
				feedUrl === fastify.config.DEFAULT_FEED_URL ? "default" : "custom";
			fastify.log.info(
				`No ${feedType} feed data found in database - data is not fresh`,
			);
			return false;
		}

		const hoursSinceLastUpdate =
			(Date.now() - latestFeedNews.createdAt.getTime()) / (1000 * 60 * 60);

		const isFresh = hoursSinceLastUpdate < maxAgeHours;
		const feedType =
			feedUrl === fastify.config.DEFAULT_FEED_URL ? "default" : "custom";

		fastify.log.info(
			`${feedType} feed data is ${isFresh ? "fresh" : "stale"} (${hoursSinceLastUpdate.toFixed(1)}h since last update)`,
		);

		return isFresh;
	} catch (error) {
		fastify.log.error("Error checking feed data freshness:", error);
		return false;
	}
}

export async function checkIfAllItemsExist(
	fastify: FastifyInstance,
	feedItems: RSSItem[],
): Promise<{
	allExist: boolean;
	existingCount: number;
	newItemsCount: number;
}> {
	let existingCount = 0;
	let newItemsCount = 0;

	for (const item of feedItems) {
		try {
			const existingNews = await fastify.prisma.news.findFirst({
				where: {
					OR: [{ link: item.link }, { guid: item.guid || item.link }],
				},
			});

			if (existingNews) {
				existingCount++;
			} else {
				newItemsCount++;
			}
		} catch (error) {
			fastify.log.error(`Error checking if item exists: ${item.title}`, error);
			newItemsCount++;
		}
	}

	const allExist = newItemsCount === 0;

	fastify.log.info(
		`Feed content analysis: ${existingCount} items already exist, ${newItemsCount} are new. All exist: ${allExist}`,
	);

	return {
		allExist,
		existingCount,
		newItemsCount,
	};
}
