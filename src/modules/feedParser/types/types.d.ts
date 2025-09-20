import type { FromSchema } from "json-schema-to-ts";
import type { schema } from "../schema/getData.schema";

const responseSchema = schema.response[200];

// Auto types
type QueryType = FromSchema<typeof schema.querystring>;

type ResponseDataSchema = typeof responseSchema.properties.data;
type DatabaseResult = FromSchema<ResponseDataSchema>;

type FeedInfoSchema = typeof responseSchema.properties.data.properties.feedInfo;
type FeedInfo = FromSchema<FeedInfoSchema>;

type NewsItemSchema =
	typeof responseSchema.properties.data.properties.items.items;
type NewsItem = FromSchema<NewsItemSchema>;

// Manual types
interface RSSItem {
	title?: string;
	link?: string;
	pubDate?: string;
	creator?: string;
	author?: string;
	contentSnippet?: string;
	content?: string;
	summary?: string;
	guid?: string;
	feedUrl?: string;
}

interface RSSFeed {
	title?: string;
	description?: string;
	link?: string;
	items?: RSSItem[];
}

interface FeedDataWithInfo extends DatabaseResult {
	feedInfo?: FeedInfo;
}

interface ParsedFeedData {
	feedInfo: FeedInfo;
	items: RSSItem[];
}

export type {
	DatabaseResult,
	FeedInfo,
	NewsItem,
	QueryType,
	RSSItem,
	RSSFeed,
	FeedDataWithInfo,
	ParsedFeedData,
};
