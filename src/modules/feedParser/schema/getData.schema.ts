export const schema = {
	querystring: {
		type: "object",
		properties: {
			url: {
				type: "string",
				format: "uri",
				description: "URL feed for parsing",
			},
			force: {
				type: "boolean",
				description: "Force parsing without checking database",
			},
		},
		additionalProperties: false,
	},
	response: {
		200: {
			type: "object",
			properties: {
				data: {
					type: "object",
					properties: {
						feedInfo: {
							type: "object",
							properties: {
								title: { type: "string" },
								description: { type: "string" },
								link: { type: "string" },
							},
						},
						items: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									title: { type: "string" },
									link: { type: "string" },
									description: { type: ["string", "null"] },
									pubDate: { type: ["string", "null"] },
									author: { type: ["string", "null"] },
									guid: { type: ["string", "null"] },
								},
							},
						},
						total: { type: "number" },
					},
				},
				cached: { type: "boolean" },
				timestamp: { type: "string" },
				newItemsAdded: { type: "number" },
			},
		},
	},
} as const;
