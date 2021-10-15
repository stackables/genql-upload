[![npm](https://img.shields.io/npm/v/genql-upload?label=genql-upload&logo=npm)](https://www.npmjs.com/package/genql-upload)
[![codecov](https://codecov.io/gh/stackables/genql-upload/branch/main/graph/badge.svg?token=ynUW2JLulr)](https://codecov.io/gh/stackables/genql-upload)

# Graphql Upload support for genql

Custom fetcher for [Genql](https://github.com/remorses/genql) graphql client that supports [Graphql Multipart Request](https://github.com/jaydenseric/graphql-multipart-request-spec) for file uploads in Graphql.

## Install

```bash
npm install genql-upload
```

## Usage

First [generate your typed client](https://genql.vercel.app/docs) and connect a [custom fetcher](https://genql.vercel.app/docs/usage/create-the-client#using-a-custom-fetcher) as shown below.

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
  // client is setup before

  const response = await client.chain.mutation
    .singleUpload({
      file: new FileUpload(fs.createReadStream("./README.md")),
    })
    .get({
      filename: true,
      mimetype: true,
      headers: true,
    });
}
```

See the [basic test](./test/) for full usage including the server setup.

## Thats it ...

... happy coding :)
