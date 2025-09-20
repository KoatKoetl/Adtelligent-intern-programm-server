interface FeedQuery {
	url?: string;
	force?: "0" | "1";
}

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
}

interface RSSFeed {
	title?: string;
	description?: string;
	link?: string;
	items?: RSSItem[];
}

interface NewsItem {
	id: string;
	title: string;
	link: string;
	description: string | null;
	pubDate: Date | null;
	author: string | null;
	guid: string | null;
	createdAt: Date;
}

interface FeedInfo {
	title: string;
	description: string;
	link: string;
}

interface DatabaseResult {
	items: NewsItem[];
	total: number;
}

interface FeedDataWithInfo extends DatabaseResult {
	feedInfo?: FeedInfo;
}

interface ParsedFeedData {
	feedInfo: FeedInfo;
	items: RSSItem[];
}

export type {
	FeedQuery,
	RSSItem,
	RSSFeed,
	NewsItem,
	FeedInfo,
	DatabaseResult,
	FeedDataWithInfo,
	ParsedFeedData,
	FeedItem,
};
