import type { ReadStream } from "fs";

export class FileUpload {
	name?: string;

	constructor(public data: ReadStream | Buffer, filename?: string) {
		if (data instanceof Buffer) {
			this.name = filename;
		} else {
			this.name = filename || String(data.path);
		}
	}
}
