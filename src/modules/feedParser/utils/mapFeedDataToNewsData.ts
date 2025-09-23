import type { ParsedFeedData, RSSItem } from "../types/types";

const mapFeedDataToNewsData = async (feedData: ParsedFeedData) => {
	return {
		...feedData,
		items: feedData.items.map((item: RSSItem, index: number) => ({
			id: `temp-${index}`,
			title: item.title || "Untitled",
			link: item.link || "",
			description: item.contentSnippet || item.content || item.summary || null,
			pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : null,
			author: item.creator || item.author || null,
			guid: item.guid || item.link || null,
			imageUrl: item.imageUrl || "",
		})),
		total: feedData.items.length,
	};
};

export default mapFeedDataToNewsData;
