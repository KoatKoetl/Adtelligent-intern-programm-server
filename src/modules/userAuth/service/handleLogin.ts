import type { FastifyInstance } from "fastify";

export async function handleUserLogin(
	fastify: FastifyInstance,
	login: string,
	password: string,
) {
	const user = await fastify.prisma.user.findUnique({
		where: { login },
	});

	if (!user) {
		throw fastify.httpErrors.badRequest("Invalid login or password.");
	}

	const isMatch = await fastify.bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw fastify.httpErrors.badRequest("Invalid login or password.");
	}

	const token = fastify.jwt.sign({
		id: user.id,
		username: user.username,
	});

	return {
		message: "Login successful.",
		token,
	};
}
