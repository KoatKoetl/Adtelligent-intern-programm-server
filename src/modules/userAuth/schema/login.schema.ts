export const loginSchema = {
	body: {
		type: "object",
		properties: {
			login: { type: "string", minLength: 2 },
			password: { type: "string" },
		},
		required: ["login", "password"],
	},
	response: {
		200: {
			type: "object",
			properties: {
				message: { type: "string" },
			},
		},
	},
} as const;
