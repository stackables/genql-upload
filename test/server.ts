import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';
import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload';
import { finished } from 'stream/promises';

const typeDefs = gql`
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
            const { createReadStream, filename, mimetype, encoding } = await args.file;

            // Invoking the `createReadStream` will return a Readable Stream.
            // See https://nodejs.org/api/stream.html#stream_readable_streams
            const stream = createReadStream();

            // This is purely for demonstration purposes and will overwrite the
            // local-file-output.txt in the current working directory on EACH upload.
            const out = require('fs').createWriteStream('local-file-output.txt');
            stream.pipe(out);
            await finished(out);

            const headers = JSON.stringify(context.req.headers);

            return { filename, mimetype, encoding, headers };
        },
    },
};

export async function startServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            return {
                req,
            };
        }
    });
    await server.start();

    const app = express();

    app.use(graphqlUploadExpress());

    server.applyMiddleware({ app });

    return app.listen({ port: 0 })
}

