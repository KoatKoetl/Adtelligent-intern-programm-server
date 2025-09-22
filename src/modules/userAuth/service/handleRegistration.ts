import type { FastifyInstance } from "fastify";

export async function handleUserRegistration(
	fastify: FastifyInstance,
	login: string,
	username: string,
	password: string,
) {
	try {
		const existingUser = await fastify.prisma.user.findUnique({
			where: { login },
		});
		if (existingUser) {
			return { message: "Username already exists" };
		}

		const passwordHash = await fastify.bcrypt.hash(password);

		const newUser = await fastify.prisma.user.create({
			data: {
				login,
				username,
				password: passwordHash,
			},
		});

		return {
			message: "User registered successfully",
			user: { username: newUser.username },
		};
	} catch (err) {
		fastify.log.error("Error registering user:", err);
		throw fastify.httpErrors.internalServerError("Failed to register user");
	}
}
