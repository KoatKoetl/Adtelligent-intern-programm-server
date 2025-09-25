import type { FastifyInstance } from "fastify";

export default async function healthRoutes(fastify: FastifyInstance) {
	fastify.get("/health", async (_request, reply) => {
		reply.send({
			status: "ok",
			uptime: process.uptime(),
			timestamp: new Date().toISOString(),
		});
	});
}
