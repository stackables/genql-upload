[![npm](https://img.shields.io/npm/v/genql-upload?label=genql-upload&logo=npm)](https://www.npmjs.com/package/genql-upload)
[![codecov](https://codecov.io/gh/stackables/genql-upload/branch/main/graph/badge.svg?token=x1DmWF8EId)](https://codecov.io/gh/stackables/genql-upload)

# Graphql Upload support for genql

Custom fetcher for [Genql](https://github.com/remorses/genql) graphql client that supports [Graphql Multipart Request](https://github.com/jaydenseric/graphql-multipart-request-spec) for file uploads in Graphql.

## Install

```bash
npm install genql-upload
```

## Usage

First [generate your typed client](https://genql.vercel.app/docs) and connect a [custom fetcher](https://genql.vercel.app/docs/usage/create-the-client#using-a-custom-fetcher) as shown below.

```graphql
# Given this schema

scalar Upload

type Mutation {
  singleUpload(file: Upload!): String
}
```

```typescript
import { createClient } from "./generated_dir";
import { createFetcher } from "genql-upload";

const client = createClient({
  fetcher: createFetcher({
    url: "http://localhost:4000/graphql",
    headers: {
      // ...
    },
  }),
});
```

In order to use the library in nodejs you need to use a custom FileUpload class to wrap any readable stream.

Example is assuming a demo server as described at https://www.apollographql.com/docs/apollo-server/data/file-uploads/

```typescript
import { FileUpload } from "genql-upload";
import fs from "fs";

async function upload() {
  // read stream is valid file input
  const file1 = new FileUpload(fs.createReadStream("./README.md"));

  // but file can also be Buffer
  const file2 = new FileUpload(Buffer.from(/* ... */), "filename.txt");

  const response = await client.mutation({
    singleUpload: {
      __args: {
        file: file1 // file2
      }
    },
  });
}
```

See the [basic test](./test/) for full usage including the server setup.

## Running locally

Generate the test sdk by running `genql --schema ./test/schema.graphql --output ./test/generated` or use the npm script `npm run test:generate`.

```bash
npm install
npm run test:generate
npm test
```

## Thats it ...

... happy coding :)
