import type { FromSchema } from "json-schema-to-ts";
import { schema } from "../schema/getData.schema";

const responseSchema = schema.response[200];

// Auto types
type ResponseDataSchema = typeof responseSchema.properties.data;
type DatabaseResult = FromSchema<ResponseDataSchema>;

type FeedInfoSchema = typeof responseSchema.properties.data.properties.feedInfo;
type FeedInfo = FromSchema<FeedInfoSchema>;

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
	imageUrl?: string | null;
}

interface RSSFeed {
	title?: string;
	description?: string;
	link?: string;
	items?: RSSItem[];
}

interface ParsedFeedData {
	feedInfo: FeedInfo;
	items: RSSItem[];
}

export type { DatabaseResult, FeedInfo, RSSItem, RSSFeed, ParsedFeedData };
