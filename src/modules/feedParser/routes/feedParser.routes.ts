import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { schema } from "../schema/getData.schema";
import isDataFresh from "../services/checkFreshData";
import getNewsFromDatabase from "../services/getDatabaseData";
import parseFeed from "../services/parseFeed";
import saveNewsToDatabase from "../services/saveNewsToDatabase";
import type { FeedDataWithInfo, FeedQuery } from "../types/types";
import mapFeedDataToNewsData from "../utils/mapFeedDataToNewsData";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	const route: FastifyInstance =
		fastify.withTypeProvider<JsonSchemaToTsProvider>();
	const DEFAULT_FEED_URL = fastify.config.DEFAULT_FEED_URL;

	route.get<{ Querystring: FeedQuery }>(
		"/feed",
		{ schema: schema },
		async (
			request: FastifyRequest<{ Querystring: FeedQuery }>,
			reply: FastifyReply,
		) => {
			try {
				const { url = DEFAULT_FEED_URL, force = false } = request.query;

				if (force) {
					fastify.log.info(`Force mode: parsing feed directly from ${url}`);
					const feedData = await parseFeed(fastify, url);
					const newsData = await mapFeedDataToNewsData(feedData);

					return reply.send({
						data: newsData,
						cached: false,
						timestamp: new Date().toISOString(),
					});
				}

				let newsData: FeedDataWithInfo | undefined;
				let fromCache = false;
				let newItemsAdded = 0;

				if (url !== DEFAULT_FEED_URL) {
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

				return reply.send({
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
				});
			} catch (error) {
				fastify.log.error("Feed endpoint error:", error);
				reply.internalServerError(error);
			}
		},
	);
}
