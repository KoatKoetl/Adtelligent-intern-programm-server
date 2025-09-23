export const parseArticleSchema = {
	querystring: {
		type: "object",
		properties: {
			url: { type: "string", format: "uri" },
		},
		required: ["url"],
	},
} as const;
