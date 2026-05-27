import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import sass from 'sass';
import { glob } from 'glob';
import CleanCSS from 'clean-css';
import { minify as terserMinify } from 'terser';

import {
	getPackage,
	getPluginRoot
} from './utils/package.mjs';

const pluginRoot = getPluginRoot();

const {
	name
} = getPackage();

const assetFolders = [
	'public',
	...glob.sync('modules/*/assets/*', {
		cwd: pluginRoot
	})
];

(async () => {
	for (const folder of assetFolders) {
		const files = glob.sync(
			`${folder}/**/*.{js,scss}`,
			{
				cwd: pluginRoot
			}
		);

		for (const file of files) {
			try {
				const absoluteFile = path.join(
					pluginRoot,
					file
				);

				const parsed = path.parse(file);

				let extension = parsed.ext;

				const content = await fs.readFile(
					absoluteFile,
					'utf8'
				);

				let output = '';

				if (extension === '.js') {
					const result = await terserMinify(
						content
					);

					output = result.code;
				}

				if (extension === '.scss') {
					const compiled = sass.compile(
						absoluteFile
					);

					const result =
						new CleanCSS().minify(
							compiled.css
						);

					output = result.styles;

					extension = '.css';
				}

				let outputPath = '';

				if (
					file.startsWith('assets/js')
				) {
					outputPath = path.join(
						pluginRoot,
						`assets/js/${name}-${parsed.name}.min${extension}`
					);
				} else if (
					file.startsWith(
						'assets/styles'
					)
				) {
					outputPath = path.join(
						pluginRoot,
						`assets/styles/${name}-${parsed.name}.min${extension}`
					);
				}

				if (!outputPath) {
					continue;
				}

				await fs.outputFile(
					outputPath,
					output
				);

				console.log(
					chalk.green(
						`✔ Minified ${file}`
					)
				);
			} catch (error) {
				console.log(
					chalk.red(
						`✖ ${file}`
					)
				);

				console.error(error);
			}
		}
	}
})();