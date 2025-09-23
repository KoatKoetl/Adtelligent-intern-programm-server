import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";

export default async function logOutUser(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.post(
		"/api/auth/logout",
		{
			preHandler: async (request) => {
				await request.jwtVerify();
			},
		},
		async (_request, reply) => {
			reply.clearCookie("token", {
				httpOnly: true,
				path: "/",
				domain: "localhost",
			});
			return { message: "Logout successful" };
		},
	);
}
