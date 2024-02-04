import { ApolloServer } from "@apollo/server";
import { koaMiddleware } from "@as-integrations/koa";
import { GraphQLUpload, graphqlUploadKoa } from "graphql-upload-ts";
import http from "http";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { finished } from "stream/promises";

const typeDefs = `#graphql
	# The implementation for this scalar is provided by the
	# 'GraphQLUpload' export from the 'graphql-upload' package
	# in the resolver map below.
	scalar Upload

	type File {
		filename: String!
		mimetype: String!
		encoding: String!
		headers: String!
	}

	type Query {
		# This is only here to satisfy the requirement that at least one
		# field be present within the 'Query' type.  This example does not
		# demonstrate how to fetch uploads back.
		otherFields: Boolean!
	}

	type Mutation {
		# Multiple uploads are supported. See graphql-upload docs for details.
		singleUpload(file: Upload!): File!
	}
`;

const resolvers = {
	// This maps the `Upload` scalar to the implementation provided
	// by the `graphql-upload` package.
	Upload: GraphQLUpload,

	Mutation: {
		singleUpload: async (parent: any, args: any, context: any) => {
			const { createReadStream, filename, mimetype, encoding } =
				await args.file;

			// Invoking the `createReadStream` will return a Readable Stream.
			// See https://nodejs.org/api/stream.html#stream_readable_streams
			const stream = createReadStream();

			// This is purely for demonstration purposes and will overwrite the
			// local-file-output.txt in the current working directory on EACH upload.
			const out = require("fs").createWriteStream("local-file-output.txt");
			stream.pipe(out);
			await finished(out);

			const headers = JSON.stringify(context.headers);

			return { filename, mimetype, encoding, headers };
		},
	},
};

export async function startServer() {
	const app = new Koa();
	const httpServer = http.createServer(app.callback());

	// Set up Apollo Server
	const server = new ApolloServer({
		typeDefs,
		resolvers,
	});
	await server.start();

	app
		.use(bodyParser())
		.use(graphqlUploadKoa({ maxFileSize: 10 * 1000 * 1000, maxFiles: 10 }))
		.use(
			koaMiddleware(server, {
				context: async ({ ctx }) => ({ headers: ctx.headers }),
			})
		);

	await new Promise((resolve) =>
		httpServer.listen({ port: 4000 }, () => resolve(true))
	);

	return httpServer;
}
