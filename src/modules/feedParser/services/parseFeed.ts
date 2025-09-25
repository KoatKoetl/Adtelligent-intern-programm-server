import retry from "async-retry";
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
	const RETRY_OPTIONS = {
		retries: 4,
		minTimeout: 500,
		factor: 2,
		onRetry: (error: Error, attempt: number) => {
			fastify.log.info(
				`Attempt ${attempt} failed to parse feed: ${error.message}. Retrying...`,
			);
		},
	};

	try {
		const attemptParse = async () => {
			fastify.log.info(`Attempting to parse feed from: ${url}`);
			const feed = await parser.parseURL(url);
			return feed;
		};

		let feed: Parser.Output<{ [key: string]: any }>;

		try {
			feed = await retry(attemptParse, RETRY_OPTIONS);
		} catch (error) {
			fastify.log.error("RSS parsing failed after all retries:", error);
			throw fastify.httpErrors.badRequest(
				`Failed to parse RSS feed after ${RETRY_OPTIONS.retries + 1} attempts: ${error.message}`,
			);
		}

		const processedItems =
			feed.items?.map((item) => {
				const imgRegex = /<img\s+src\s*=\s*['"]([^'"]+)['"]/;
				const imgMatch = item.content?.match(imgRegex);

				return {
					...item,
					imageUrl: imgMatch ? imgMatch[1] : null,
				};
			}) || [];

		return {
			feedInfo: {
				title: feed.title || "Untitled Feed",
				description: feed.description || "",
				link: feed.link || url,
			},
			items: processedItems,
		};
	} catch (error) {
		fastify.log.error("RSS parsing error:", error);
		throw fastify.httpErrors.badRequest(
			`Failed to parse RSS feed: ${error.message}`,
		);
	}
}

export default parseFeed;
