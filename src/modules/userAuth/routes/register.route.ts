import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { registerSchema } from "../schema/register.schema";
import { handleUserRegistration } from "../service/handleRegistration";

export default async function registerUser(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.post(
		"/auth/register",
		{ schema: registerSchema },
		async (request, reply) => {
			try {
				const { login, username, password } = request.body;
				const newUser = await handleUserRegistration(
					fastify,
					login,
					username,
					password,
				);

				reply.code(201).send(newUser);
			} catch (error) {
				fastify.log.error("Register endpoint error:", error);
				reply.internalServerError(error);
			}
		},
	);
}
