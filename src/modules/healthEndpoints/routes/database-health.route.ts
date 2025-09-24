import type { FastifyInstance } from "fastify";
import { checkDbConnection } from "../service/dbconnection";

export default async function healthRoutes(fastify: FastifyInstance) {
	fastify.get("/health-db", async (_request, reply) => {
		try {
			const dbStatus = await checkDbConnection(fastify);
			reply.send(dbStatus);
		} catch (error) {
			fastify.log.error("Database health endpoint error:", error);
			reply.internalServerError(error);
		}
	});
}
