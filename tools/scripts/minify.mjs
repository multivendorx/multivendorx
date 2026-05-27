import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import sass from 'sass';
import { glob } from 'glob';
import CleanCSS from 'clean-css';
import { minify as terserMinify } from 'terser';

import { getPackage, getPluginRoot } from './utils/package.mjs';

const pluginRoot = getPluginRoot();
const { name } = getPackage();

/**
 * Asset roots to scan
 */
const assetFolders = [
	'public',
	...glob.sync('modules/*/assets/*', {
		cwd: pluginRoot,
		absolute: false,
	})
];

(async () => {
	for (const folder of assetFolders) {
		const files = glob.sync(`${folder}/**/*.{js,scss}`, {
			cwd: pluginRoot,
			ignore: ['**/*.min.*']
		});

		for (const file of files) {
			try {
				const normalizedFile = file.replace(/\\/g, '/');

				const absoluteFile = path.join(pluginRoot, file);
				const parsed = path.parse(file);

				const ext = parsed.ext;

				const content = await fs.readFile(absoluteFile, 'utf8');

				let output = '';

				/**
				 * JS MINIFY
				 */
				if (ext === '.js') {
					const result = await terserMinify(content);

					if (!result.code) {
						throw new Error(`Terser failed for ${file}`);
					}

					output = result.code;
				}

				/**
				 * SCSS MINIFY → CSS
				 */
				if (ext === '.scss') {
					const compiled = sass.compile(absoluteFile);

					const result = new CleanCSS().minify(compiled.css);

					output = result.styles;
				}

				let outputPath = '';

				const isJs = ext === '.js';
				const isScss = ext === '.scss';

				/**
				 * PUBLIC ASSETS
				 */
				const isPublicJs = isJs && normalizedFile.startsWith('public/js/');
				const isPublicStyles = isScss && normalizedFile.startsWith('public/styles/');

				/**
				 * MODULE ASSETS
				 */
				const isModuleJs =
					isJs &&
					(normalizedFile.startsWith('modules/') || normalizedFile.includes('/modules/')) &&
					normalizedFile.includes('/assets/js/');

				const isModuleStyles =
					isScss &&
					(normalizedFile.startsWith('modules/') || normalizedFile.includes('/modules/')) &&
					normalizedFile.includes('/assets/styles/');

				/**
				 * OUTPUT ROUTING
				 */
				const sourceDir = path.dirname(normalizedFile);
				const sourceSlug = sourceDir
					.replace(/[\\/]+/g, '-')
					.replace(/[^a-zA-Z0-9._-]/g, '')
					.replace(/^-+|-+$/g, '') || 'root';

				if (isPublicJs || isModuleJs) {
					outputPath = path.join(
						pluginRoot,
						`assets/js/${name}-${sourceSlug}-${parsed.name}.min.js`
					);
				} else if (isPublicStyles || isModuleStyles) {
					outputPath = path.join(
						pluginRoot,
						`assets/styles/${name}-${sourceSlug}-${parsed.name}.min.css`
					);
				}

				/**
				 * SKIP UNKNOWN FILES
				 */
				if (!outputPath || !output) {
					continue;
				}

				await fs.outputFile(outputPath, output);

				console.log(chalk.green(`✔ Minified ${file}`));
			} catch (error) {
				console.log(chalk.red(`✖ Failed ${file}`));
				console.error(error);
			}
		}
	}
})();