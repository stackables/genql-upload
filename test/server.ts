import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "http";
import { Readable } from "node:stream";
import { finished } from "stream/promises";

const typeDefs = `#graphql
	# The implementation for this scalar is provided by the
	# 'GraphQLUpload' export from the 'graphql-upload' package
	# in the resolver map below.
	scalar File

	type FileOutput {
		filename: String!
		mimetype: String!
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
		singleUpload(file: File!): FileOutput!
	}
`;

const resolvers = {
	Mutation: {
		singleUpload: async (
			parent: any,
			args: { file: File },
			context: { request: Request }
		) => {
			const payload = {
				filename: args.file.name,
				mimetype: args.file.type,
			};

			const stream = Readable.from(args.file.stream());

			// This is purely for demonstration purposes and will overwrite the
			// local-file-output.txt in the current working directory on EACH upload.
			const out = require("fs").createWriteStream("local-file-output.txt");
			stream.pipe(out);
			await finished(out);

			const headers = JSON.stringify(
				Object.fromEntries([...context.request.headers.entries()])
			);

			return { ...payload, headers };
		},
	},
};

export async function startServer() {
	const yoga = createYoga({
		schema: createSchema({
			typeDefs,
			resolvers,
		}),
	});

	const httpServer = createServer(yoga);

	await new Promise((resolve) =>
		httpServer.listen({ port: 4000 }, () => resolve(true))
	);

	return httpServer;
}
