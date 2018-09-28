const log = require("log-less-fancy")();
const { readMetadata } = require("./mbtileReader");
const fs = require("fs");
var path = require("path");

const template = fs.readFileSync("index.html", "utf8");

const walkSync = (dir, filelist = {}, mapFile) =>
	fs
		.readdirSync(dir)
		.map(
			file =>
				fs.statSync(path.join(dir, file)).isDirectory()
					? {
						name: file,
						isDirectory: true,
						files: walkSync(path.join(dir, file), filelist, mapFile)
					}
					: mapFile(dir, file)
		)
		.reduce((o, item) => {
			o[item.name] = item;
			return o;
		}, {});

function readMbtilesMeta(filepath, meta) {
	readMetadata(filepath).then(mbmeta => {
		if (mbmeta.error) {
			log.warn(file + ": " + mbmeta.error.message);
			meta.error = mbmeta.error.message;
		}

		delete mbmeta.json;
		meta.mbtiles = mbmeta;
	});
}

function readFormatSpecificMetadata(dir, file) {
	const ext = path.extname(file).toLowerCase();
	const filepath = path.join(dir, file);
	const parsed = path.parse(file);
	const stat = fs.statSync(filepath);
	const meta = {
		name: parsed.name,
		file: {
			ext: parsed.ext,
			file: parsed.base,
			path: filepath,
			size: stat.size,
			modified: stat.mtime
		}
	};
	switch (ext) {
	case ".mbtiles":
		readMbtilesMeta(filepath, meta);
	}
	return meta;
}

function mapFile(dir, file) {
	const filepath = path.join(dir, file);
	return readFormatSpecificMetadata(dir, file);
}

class Index {
	constructor(index) {
		this.index = index;
	}

	get(relativePath) {
		const parts = relativePath.split("/");
		let node = this.index;
		for (const part of parts) {
			if (part) {
				if (!node.files[part]) return null;
				node = node.files[part];
			}
		}
		return node;
	}

	htmlRow(key, ext, size, modified, extra) {
		return `<tr><td><a href="${key}">${key}</a></td><td>${ext}</td><td align="right">${size}</td><td>${modified &&
      modified.toISOString()}</td><td>${extra}</td></tr>`;
	}

	generateListing(relativePath) {
		const node = this.get(relativePath);
		if (!node) return null;
		if (node.isDirectory) {
			const htmlFragment = Object.keys(node.files)
				.map(key => {
					const item = node.files[key];
					if (item.isDirectory)
						return this.htmlRow(key, "directory", "", "", "");
					const mbtiles = item.mbtiles;
					return this.htmlRow(
						key,
						item.file.ext,
						item.file.size,
						item.file.modified,
						mbtiles
							? `${mbtiles.format}, zoom ${mbtiles.minzoom} - ${
								mbtiles.maxzoom
							}`
							: ""
					);
				})
				.join("\n");
			return template.replace("$rows", htmlFragment);
		}
		return `<a href="${node.file.name}">${node.file.name}</a>`;
	}
}

function index(mbtilesPath) {
	const index = walkSync(mbtilesPath, {}, mapFile);
	return new Index({ isDirectory: true, files: index });
}

module.exports = index;
