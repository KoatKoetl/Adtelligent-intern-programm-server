import type { FromSchema } from "json-schema-to-ts";

export const EnvSchema = {
	type: "object",
	properties: {
		PORT: { type: "number" },
		HOST: { type: "string" },
		DATABASE_URL: { type: "string", format: "uri" },
		DEFAULT_FEED_URL: { type: "string", format: "uri" },
		JWT_SECRET: { type: "string" },
	},
	required: ["PORT", "HOST", "DATABASE_URL", "DEFAULT_FEED_URL", "JWT_SECRET"],
	additionalProperties: false,
} as const;

export type Config = FromSchema<typeof EnvSchema>;
