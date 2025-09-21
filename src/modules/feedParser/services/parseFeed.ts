import type { FastifyInstance } from "fastify";
import Parser from "rss-parser";
import type { ParsedFeedData } from "../types/types";

const parser = new Parser({
	customFields: {
		feed: ["language", "copyright"],
		item: ["guid", "category"],
	},
});

async function parseFeed(
	fastify: FastifyInstance,
	url: string,
): Promise<ParsedFeedData> {
	try {
		fastify.log.info(`Parsing feed from: ${url}`);

		const feed = await parser.parseURL(url);

		return {
			feedInfo: {
				title: feed.title || "Untitled Feed",
				description: feed.description || "",
				link: feed.link || url,
			},
			items: feed.items || [],
		};
	} catch (error) {
		fastify.log.error("RSS parsing error:", error);
		throw fastify.httpErrors.badRequest(
			`Failed to parse RSS feed: ${error.message}`,
		);
	}
}

export default parseFeed;
