export const parseArticleSchema = {
	querystring: {
		type: "object",
		properties: {
			url: { type: "string", format: "uri" },
		},
		required: ["url"],
	},
	response: {
		200: {
			type: "object",
			properties: {
				url: { type: "string" },
				title: { type: "string" },
				heroImage: { type: "string" },
				content: { type: "string" },
			},
		},
	},
} as const;
