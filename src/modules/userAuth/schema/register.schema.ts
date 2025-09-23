import { passwordPattern } from "../../../constants/constants";

export const registerSchema = {
	body: {
		type: "object",
		properties: {
			username: { type: "string", minLength: 2 },
			login: { type: "string", minLength: 2 },
			password: {
				type: "string",
				minLength: 8,
				pattern: passwordPattern,
			},
		},
		required: ["username", "login", "password"],
	},
} as const;
