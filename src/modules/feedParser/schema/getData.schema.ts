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
				type: "string",
				enum: ["0", "1"],
				description:
					"Force parsing: 1 - parse directly from URL, 0 - check database",
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
									pubDate: {
										type: ["string", "null"],
										format: "date-time",
									},
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
