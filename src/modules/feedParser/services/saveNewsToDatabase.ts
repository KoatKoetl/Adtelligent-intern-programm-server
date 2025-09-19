import type { FastifyInstance } from "fastify/types/instance";
import type { RSSItem } from "../types/types";

async function saveNewsToDatabase(
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

export default saveNewsToDatabase;
