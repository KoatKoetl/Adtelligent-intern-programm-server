export const loginSchema = {
	body: {
		type: "object",
		properties: {
			login: { type: "string", minLength: 2 },
			password: { type: "string" },
		},
		required: ["login", "password"],
	},
} as const;
