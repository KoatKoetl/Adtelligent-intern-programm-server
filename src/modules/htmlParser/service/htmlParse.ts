import * as cheerio from "cheerio";
import type { FastifyInstance } from "fastify";

interface ParsedArticle {
	url: string;
	title: string;
	heroImage: string;
	content: string;
}

const userAgent =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
const timeout = 15000; // 15 seconds

export async function parseArticle(
	fastify: FastifyInstance,
	url: string,
): Promise<ParsedArticle> {
	try {
		fastify.log.info(`Parsing article from: ${url}`);

		if (!isValidUrl(url)) {
			throw fastify.httpErrors.badRequest("Invalid URL format");
		}

		const html = await fetchHtml(url);
		const $ = cheerio.load(html);

		const parsedData: ParsedArticle = {
			url,
			title: extractTitle($),
			heroImage: extractHeroImage($, url),
			content: extractContent($),
		};

		if (!parsedData.title || !parsedData.content) {
			throw fastify.httpErrors.unprocessableEntity(
				"Could not extract meaningful content from the page",
			);
		}

		fastify.log.info(`Successfully parsed article: ${parsedData.title}`);
		return parsedData;
	} catch (error) {
		fastify.log.error("HTML parsing error:", error);
		if (error.statusCode) {
			throw error;
		}
		throw handleParsingError(fastify, error);
	}
}

async function fetchHtml(url: string): Promise<string> {
	const controller = new AbortController();
	const fetchTimeout = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"User-Agent": userAgent,
				Accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"Accept-Language": "en-US,en;q=0.5",
				Connection: "keep-alive",
				"Upgrade-Insecure-Requests": "1",
			},
			signal: controller.signal,
			redirect: "follow",
		});

		clearTimeout(fetchTimeout);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.text();
	} catch (error) {
		clearTimeout(fetchTimeout);
		if (error.name === "AbortError") {
			throw new Error("Request timed out");
		}
		throw error;
	}
}

function extractTitle($: cheerio.Root): string {
	const h1 = $("h1").first().text().trim();
	if (h1) return h1;

	const ogTitle = $('meta[property="og:title"]').attr("content");
	if (ogTitle) return ogTitle.trim();

	const title = $("title").first().text().trim();
	return title || "";
}

function extractHeroImage($: cheerio.Root, url: string): string {
	const selectors = [
		'meta[property="og:image"]',
		'meta[name="twitter:image"]',
		"article img",
		".post-thumbnail img",
		".featured-image img",
	];

	for (const selector of selectors) {
		let imageUrl = "";

		if (selector.startsWith("meta")) {
			imageUrl = $(selector).attr("content") || "";
		} else {
			const element = $(selector).first();
			if (element.length) {
				imageUrl = element.attr("src") || element.attr("data-src") || "";
			}
		}

		if (imageUrl) {
			return resolveUrl(imageUrl, url);
		}
	}

	return "";
}

function extractContent($: cheerio.Root): string {
	const contentSelectors = [
		"article",
		".post-content",
		".entry-content",
		".article-content",
	];

	let contentHtml = "";

	for (const selector of contentSelectors) {
		const element = $(selector).first();
		if (element.length > 0) {
			const paragraphs = element.find("p, h1, h2, h3, h4, h5, h6, ul, ol");
			const textBlocks: string[] = [];

			paragraphs.each((_i, el) => {
				const innerHtml = $(el).html()?.trim();
				if (innerHtml && innerHtml.length > 20) {
					textBlocks.push(innerHtml);
				}
			});

			contentHtml = textBlocks.join("\n\n");

			if (contentHtml && contentHtml.length > 200) {
				return contentHtml;
			}
		}
	}

	removeUnwantedElements($);
	const fallbackParagraphs = $("p")
		.map((_i, el) => $(el).html()?.trim())
		.get()
		.filter((p) => p && p.length > 50);

	return fallbackParagraphs.join("\n\n") || "";
}

function removeUnwantedElements($: cheerio.Root): void {
	const unwantedSelectors = [
		"script",
		"style",
		"nav",
		"header",
		"footer",
		".advertisement",
		".ads",
		".social-share",
		".comments",
		".sidebar",
		".related-posts",
		".author-bio",
		".newsletter-signup",
	];

	unwantedSelectors.forEach((selector) => {
		$(selector).remove();
	});
}

function resolveUrl(relativeUrl: string, baseUrl: string): string {
	try {
		return new URL(relativeUrl, baseUrl).toString();
	} catch {
		return relativeUrl;
	}
}

function isValidUrl(string: string): boolean {
	try {
		new URL(string);
		return true;
	} catch {
		return false;
	}
}

function handleParsingError(fastify: FastifyInstance, error: any) {
	if (error.message.includes("status:")) {
		const status = parseInt(error.message.split("status:")[1].trim(), 10);
		if (status === 403) {
			return fastify.httpErrors.forbidden(
				"Access forbidden - website blocking scraping",
			);
		}
		if (status === 404) {
			return fastify.httpErrors.notFound("Article not found");
		}
		if (status >= 500) {
			return fastify.httpErrors.badGateway("Website server error");
		}
	}
	if (error.message.includes("Request timed out")) {
		return fastify.httpErrors.requestTimeout("Request timeout");
	}
	if (error.cause && error.cause.code === "ENOTFOUND") {
		return fastify.httpErrors.notFound("Website not found");
	}
	return fastify.httpErrors.internalServerError("Failed to parse article");
}
