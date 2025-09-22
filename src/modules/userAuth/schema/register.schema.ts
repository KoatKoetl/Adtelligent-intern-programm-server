export const registerSchema = {
	body: {
		type: "object",
		properties: {
			username: { type: "string", minLength: 2 },
			login: { type: "string", minLength: 2 },
			password: {
				type: "string",
				minLength: 8,
				pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
			},
		},
		required: ["username", "login", "password"],
	},
} as const;
