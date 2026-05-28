import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';

import {
	getPackage,
	getPluginRoot,
	getPluginSlug,
} from './utils/package.mjs';

const pluginRoot =
	getPluginRoot();

const {
	version,
	mainPluginFile
} = getPackage();

const pluginSlug =
	getPluginSlug();

const releaseDir = path.join(
	pluginRoot,
	'release'
);

const buildDir = path.join(
	releaseDir,
	pluginSlug
);

const zipName =
	`${pluginSlug}-v${version}.zip`;

const includeFiles = [
	'assets',
	'classes',
	'languages',
	'templates',
	'modules',
	'vendor',
	'readme.txt',
	'config.php',
	'composer.json',
	'composer.lock',
	mainPluginFile
];

fs.removeSync(buildDir);

fs.ensureDirSync(buildDir);

console.log(
	chalk.cyan(
		`📦 Preparing ${pluginSlug}`
	)
);

for (const file of includeFiles) {
	const source = path.join(
		pluginRoot,
		file
	);

	if (!fs.existsSync(source)) {
		continue;
	}

	fs.copySync(
		source,
		path.join(buildDir, file)
	);
}

execSync(
	'composer install --no-dev --optimize-autoloader',
	{
		cwd: buildDir,
		stdio: 'inherit'
	}
);

fs.removeSync(
	path.join(
		buildDir,
		'composer.json'
	)
);

fs.removeSync(
	path.join(
		buildDir,
		'composer.lock'
	)
);

execSync(
	`zip -rq ${zipName} ${pluginSlug}`,
	{
		cwd: releaseDir,
		stdio: 'inherit'
	}
);

fs.removeSync(buildDir);

console.log(
	chalk.green(
		`✔ Release created: ${zipName}`
	)
);