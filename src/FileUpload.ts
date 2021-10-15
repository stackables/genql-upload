import { ReactNativeFile } from "extract-files";
import type { ReadStream } from 'fs';

export class FileUpload extends ReactNativeFile {
    constructor(private data: ReadStream) {
        super({ uri: '', name: String(data.path) })
    }
}