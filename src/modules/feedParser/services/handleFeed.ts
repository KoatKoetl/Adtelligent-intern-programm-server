import type { FastifyInstance } from "fastify";
import {
	getNewsFromDatabase,
	isDataFresh,
	saveNewsToDatabase,
} from "../services/databaseService";
import parseFeed from "../services/parseFeed";
import type { FeedDataWithInfo } from "../types/types";
import mapFeedDataToNewsData from "../utils/mapFeedDataToNewsData";

export async function getFeedData(
	fastify: FastifyInstance,
	url: string,
	force: string,
) {
	const isForceMode = force === "1";

	if (isForceMode) {
		fastify.log.info(`Force mode: parsing feed directly from ${url}`);
		const feedData = await parseFeed(fastify, url);
		const newsData = await mapFeedDataToNewsData(feedData);

		return {
			data: newsData,
			cached: false,
			timestamp: new Date().toISOString(),
		};
	}

	let newsData: FeedDataWithInfo | undefined;
	let fromCache = false;
	let newItemsAdded = 0;

	if (url !== fastify.config.DEFAULT_FEED_URL) {
		fastify.log.info(
			`Custom URL provided: ${url}, parsing and saving to database`,
		);

		const feedData = await parseFeed(fastify, url);
		newItemsAdded = await saveNewsToDatabase(fastify, feedData.items);
		newsData = await getNewsFromDatabase(fastify);
		newsData.feedInfo = feedData.feedInfo;
		fromCache = false;

		fastify.log.info(
			`Processed custom URL: ${url}, added ${newItemsAdded} items`,
		);
	} else {
		const dataIsFresh = await isDataFresh(fastify);

		if (dataIsFresh) {
			newsData = await getNewsFromDatabase(fastify);
			fromCache = true;
			fastify.log.info("Returning cached news from database");
		} else {
			fastify.log.info(
				`Data isn't fresh, fetching fresh data from default feed: ${url}`,
			);

			const feedData = await parseFeed(fastify, url);
			newItemsAdded = await saveNewsToDatabase(fastify, feedData.items);
			newsData = await getNewsFromDatabase(fastify);
			newsData.feedInfo = feedData.feedInfo;
			fromCache = false;
		}
	}

	return {
		data: {
			feedInfo: newsData.feedInfo || {
				title: "News Feed",
				description: "Latest news",
				link: url,
			},
			items: newsData.items,
			total: newsData.total,
		},
		cached: fromCache,
		timestamp: new Date().toISOString(),
		newItemsAdded,
	};
}
