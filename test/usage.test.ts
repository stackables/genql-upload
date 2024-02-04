import fs from "fs";
import fsp from "fs/promises";
import { AddressInfo, Server } from "net";
import { FileUpload, createFetcher } from "../src";
import { createClient } from "./generated";
import { startServer } from "./server";

let server: Server;
let serverUrl: string;

beforeAll(async () => {
	server = await startServer();
	const address = server.address() as AddressInfo;
	serverUrl = `http://localhost:${address.port}/graphql`;

	try {
		await fsp.unlink("local-file-output.txt");
	} catch (error) {
		// ignore this one :)
	}
});

afterAll(async () => {
	if (server) {
		server.close();
	}
});

test("Test with createReadStream", async () => {
	const client = createClient({
		fetcher: createFetcher({
			url: serverUrl,
			headers: async () => {
				return {
					"X-Test": "test",
					"x-apollo-operation-name": "singleUpload",
				};
			},
		}),
	});

	const f = await client.mutation({
		singleUpload: {
			__args: {
				file: new FileUpload(fs.createReadStream("./SECURITY.md")),
			},
			filename: true,
			mimetype: true,
			headers: true,
		},
	});

	expect(f.singleUpload.filename).toBe("SECURITY.md");
	expect(f.singleUpload.mimetype).toBe("text/markdown");

	const headers = JSON.parse(f.singleUpload.headers);
	expect(headers["x-test"]).toBe("test");

	// expect this to not throw
	await fsp.unlink("local-file-output.txt");
});

test("Test with Buffer", async () => {
	const client = createClient({
		fetcher: createFetcher({
			url: serverUrl,
			headers: async () => {
				return {
					"X-Test": "test",
					"x-apollo-operation-name": "singleUpload",
				};
			},
		}),
	});

	const fileBuffer = fs.readFileSync("./SECURITY.md");

	const f = await client.mutation({
		singleUpload: {
			__args: {
				file: new FileUpload(fileBuffer, "SECURITY.md"),
			},
			filename: true,
			mimetype: true,
			headers: true,
		},
	});

	expect(f.singleUpload.filename).toBe("SECURITY.md");
	expect(f.singleUpload.mimetype).toBe("text/markdown");

	const headers = JSON.parse(f.singleUpload.headers);
	expect(headers["x-test"]).toBe("test");

	// expect this to not throw
	await fsp.unlink("local-file-output.txt");
});
