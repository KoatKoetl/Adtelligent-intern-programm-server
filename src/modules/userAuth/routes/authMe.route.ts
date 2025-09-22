import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { JWTUser } from "../types/types";

export default async function authUser(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.get(
		"/api/auth/me",
		{
			preHandler: async (request) => {
				await request.jwtVerify();
			},
		},
		async (request, reply) => {
			try {
				const user = request.user as JWTUser;

				return {
					id: user.id,
					username: user.username,
				};
			} catch (error) {
				fastify.log.error("User info error:", error);
				reply.internalServerError("Failed to get user info");
			}
		},
	);
}
