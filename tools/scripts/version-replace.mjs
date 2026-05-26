import { replaceInFile } from 'replace-in-file';
import fs from 'node:fs';
import path from 'node:path';

import { getPackage } from './utils/package.mjs';

const { version, mainPluginFile } = getPackage();

const possiblePaths = [
	'classes/**/*',
	'src/**/*',
	'templates/**/*',
	'assets/**/*',
	'modules/**/*',
	'config.php',
	mainPluginFile
];

const files = [];

for (const pattern of possiblePaths) {
	// Handle glob patterns like assets/**/*
	if (pattern.includes('/**/*')) {
		const baseDir = pattern.replace('/**/*', '');

		if (!fs.existsSync(baseDir)) {
			continue;
		}

		if (!fs.statSync(baseDir).isDirectory()) {
			continue;
		}

		// Recursively check if directory contains at least one file
		const hasFiles = (dir) => {
			const entries = fs.readdirSync(dir, {
				withFileTypes: true
			});

			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);

				if (entry.isFile()) {
					return true;
				}

				if (entry.isDirectory() && hasFiles(fullPath)) {
					return true;
				}
			}

			return false;
		};

		if (hasFiles(baseDir)) {
			files.push(pattern);
		}

		continue;
	}

	// Handle normal files
	if (
		fs.existsSync(pattern) &&
		fs.statSync(pattern).isFile()
	) {
		files.push(pattern);
	}
}

if (files.length) {
	await replaceInFile({
		files,
		from: [
			/PRODUCT_VERSION/g,
			/PRO_PRODUCT_VERSION/g
		],
		to: version
	});

	console.log(`✔ Version updated to ${version}`);
} else {
	console.log('⚠ No matching files or folders found');
}