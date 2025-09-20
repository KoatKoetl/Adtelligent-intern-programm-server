import type { FastifyInstance } from "fastify";
import {
	checkIfAllItemsExist,
	getNewsFromDatabase,
	isFeedDataFresh,
	saveNewsToDatabase,
} from "../services/databaseService";
import parseFeed from "../services/parseFeed";
import type { ParsedFeedData } from "../types/types";
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

	return await handleFeedUrl(fastify, url);
}

async function handleFeedUrl(fastify: FastifyInstance, url: string) {
	const feedDataIsFresh = await isFeedDataFresh(fastify, url);

	if (feedDataIsFresh) {
		return await handleCachedData(fastify, url);
	} else {
		return await handleFeedWithContentCheck(fastify, url);
	}
}

async function handleCachedData(fastify: FastifyInstance, url: string) {
	const newsData = await getNewsFromDatabase(fastify);

	if (newsData.items && newsData.items.length === 0) {
		fastify.log.info("No cached items found, fetching fresh data instead");
		return await handleFeedWithContentCheck(fastify, url);
	}

	const isCustomUrl = url !== fastify.config.DEFAULT_FEED_URL;
	const feedType = isCustomUrl ? "custom feed" : "default feed";

	fastify.log.info(
		`Returning cached news from database for ${feedType}: ${url}`,
	);

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
		cached: true,
		timestamp: new Date().toISOString(),
		newItemsAdded: 0,
	};
}

async function handleFeedWithContentCheck(
	fastify: FastifyInstance,
	url: string,
) {
	const isCustomUrl = url !== fastify.config.DEFAULT_FEED_URL;
	const feedType = isCustomUrl ? "custom feed" : "default feed";

	fastify.log.info(`Checking ${feedType} for new content: ${url}`);

	const feedData = await parseFeed(fastify, url);

	const { allExist, newItemsCount } = await checkIfAllItemsExist(
		fastify,
		feedData.items,
	);

	if (allExist) {
		return await handleAllItemsExist(fastify, url, feedType, feedData);
	}

	return await handleNewItemsFound(
		fastify,
		url,
		feedType,
		feedData,
		newItemsCount,
	);
}

async function handleAllItemsExist(
	fastify: FastifyInstance,
	url: string,
	feedType: string,
	feedData: ParsedFeedData,
) {
	fastify.log.info(
		`All items from ${feedType} already exist in database, returning cached data`,
	);

	const newsData = await getNewsFromDatabase(fastify);
	newsData.feedInfo = feedData.feedInfo;

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
		cached: true,
		timestamp: new Date().toISOString(),
		newItemsAdded: 0,
	};
}

async function handleNewItemsFound(
	fastify: FastifyInstance,
	url: string,
	feedType: string,
	feedData: ParsedFeedData,
	newItemsCount: number,
) {
	fastify.log.info(
		`Found ${newItemsCount} new items in ${feedType}, saving to database`,
	);

	const newItemsAdded = await saveNewsToDatabase(fastify, feedData.items, url);

	const newsData = await getNewsFromDatabase(fastify);
	newsData.feedInfo = feedData.feedInfo;

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
		cached: false,
		timestamp: new Date().toISOString(),
		newItemsAdded,
	};
}
