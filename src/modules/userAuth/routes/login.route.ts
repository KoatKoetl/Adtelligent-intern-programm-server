import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { loginSchema } from "../schema/login.schema";
import { handleUserLogin } from "../service/handleLogin";

export default async function logInUser(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.post("/auth/login", { schema: loginSchema }, async (request, reply) => {
		try {
			const { login, password } = request.body;
			const user = await handleUserLogin(fastify, login, password);
			reply.setCookie("token", user.token, {
				httpOnly: true,
				path: "/",
				sameSite: "none",
				secure: true,
			});
			reply.send({ message: user.message });
		} catch (error) {
			fastify.log.error("Login endpoint error:", error);
			reply.unauthorized(error);
		}
	});
}
