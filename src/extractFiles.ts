import { FileUpload } from "./FileUpload";

function defaultIsExtractableFile(value: unknown) {
	return (
		(typeof File !== "undefined" && value instanceof File) ||
		(typeof Blob !== "undefined" && value instanceof Blob) ||
		value instanceof FileUpload
	);
}

// Originally from https://github.com/jaydenseric/extract-files/blob/v11.0.0/public/extractFiles.js
// MIT licenses
export function extractFiles(
	value: unknown,
	path = "",
	isExtractableFile = defaultIsExtractableFile
) {
	// Map of extracted files and their object paths within the input value.
	const files = new Map();

	// Map of arrays and objects recursed within the input value and their clones,
	// for reusing clones of values that are referenced multiple times within the
	// input value.
	const clones = new Map();

	function recurse(value: any, path: string, recursed: Set<unknown>) {
		let clone = value;

		if (isExtractableFile(value)) {
			clone = null;

			const filePaths = files.get(value);

			filePaths ? filePaths.push(path) : files.set(value, [path]);
		} else {
			const isList =
				Array.isArray(value) ||
				(typeof FileList !== "undefined" && value instanceof FileList);

			const isObject = value && value.constructor === Object;

			if (isList || isObject) {
				const hasClone = clones.has(value);

				if (hasClone) clone = clones.get(value);
				else {
					clone = isList ? [] : {};
					clones.set(value, clone);
				}

				if (!recursed.has(value)) {
					const pathPrefix = path ? `${path}.` : "";
					const recursedDeeper = new Set(recursed).add(value);

					if (isList) {
						let index = 0;

						for (const item of value as any) {
							const itemClone = recurse(
								item,
								pathPrefix + index++,
								recursedDeeper
							);

							if (!hasClone) {
								clone.push(itemClone);
							}
						}
					} else {
						for (const key in value) {
							const propertyClone = recurse(
								value[key],
								pathPrefix + key,
								recursedDeeper
							);

							if (!hasClone) clone[key] = propertyClone;
						}
					}
				}
			}
		}

		return clone;
	}

	return {
		clone: recurse(value, path, new Set()),
		files,
	};
}
