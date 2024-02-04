import FormData from "form-data";
import fetch from "isomorphic-fetch";
import { extractFiles } from "./extractFiles";

type HeadersInit = Record<string, string>;

type Headers = HeadersInit | (() => HeadersInit) | (() => Promise<HeadersInit>);

interface GraphqlOperation {
	query: string;
	variables?: { [name: string]: any };
	operationName?: string;
}

interface ExecutionResult<TData = { [key: string]: any }> {
	errors?: Array<Error>;
	data?: TData | null;
}

export interface GenqlUploadOptions {
	url: string;
	headers?: Headers;
}

export function createFetcher(opts: GenqlUploadOptions) {
	const url = opts.url;

	return async (
		operation: GraphqlOperation | GraphqlOperation[]
	): Promise<ExecutionResult | ExecutionResult[]> => {
		if (Array.isArray(operation)) {
			throw new Error("Batch uploads are not supported");
		}

		const { clone, files } = extractFiles(operation);

		const formData = new FormData();

		// 1. First document is graphql query with variables
		formData.append("operations", JSON.stringify(clone));

		// 2. Second document maps files to variable locations
		const map: any = {};
		let i = 0;
		files.forEach((paths: any) => {
			map[i++] = paths;
		});
		formData.append("map", JSON.stringify(map));

		// 3. all files not (same index as in map)
		let j = 0;
		for (const [file] of files) {
			formData.append(`${j++}`, file.data, file.name);
		}

		// normal fetch
		let headersObject =
			typeof opts.headers == "function" ? await opts.headers() : opts.headers;

		headersObject = headersObject || {};

		const res = await fetch(url, {
			method: "POST",
			headers: {
				...headersObject,
			},
			body: formData as any,
		});

		if (!res.ok) {
			throw new Error(`${res.statusText}: ${await res.text()}`);
		}
		const json = (await res.json()) as any;
		return json;
	};
}
