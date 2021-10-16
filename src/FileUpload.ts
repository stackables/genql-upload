import { ReactNativeFile } from "extract-files";
import type { ReadStream } from 'fs';

export class FileUpload extends ReactNativeFile {
    constructor(public data: ReadStream | Buffer, filename?: string) {
        super({ uri: '' })

        if (data instanceof Buffer) {
            this.name = filename
        } else {
            this.name = filename || String(data.path)
        }
    }
}