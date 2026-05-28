import fs from 'fs-extra';
import path from 'path';

export function getPackage() {
	return fs.readJsonSync(
		path.join(
			process.cwd(),
			'package.json'
		)
	);
}

export function getPluginRoot() {
	return process.cwd();
}

export function getPluginSlug() {
	const pkg = getPackage();

	return (
		pkg.pluginSlug ||
		pkg.name
	);
}