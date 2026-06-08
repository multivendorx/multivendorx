import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import sass from 'sass';
import { glob } from 'glob';
import CleanCSS from 'clean-css';
import { minify as terserMinify } from 'terser';

import {
	getPackage,
	getPluginRoot,
} from './utils/package.mjs';

const pluginRoot = getPluginRoot();

const { name } = getPackage();

const cleanCss = new CleanCSS();

/**
 * Asset types
 */
const ASSETS = {
	js: {
		output: 'js',
		minify: async (file) => {
			const result =
				await terserMinify(
					await fs.readFile(
						file,
						'utf8'
					)
				);

			if (!result.code) {
				throw new Error(
					'Terser minification failed'
				);
			}

			return result.code;
		},
	},

	scss: {
		output: 'styles',

		extension: 'css',

		minify: async (file) => {
			const result =
				cleanCss.minify(
					sass.compile(file).css
				);

			if (result.errors.length) {
				throw new Error(
					result.errors.join('\n')
				);
			}

			return result.styles;
		},
	},
};

/**
 * Remove generated assets
 */
const cleanAssets = async () => {
	const files = await glob(
		'assets/**/*.{min.js,min.css}',
		{
			cwd: pluginRoot,
			absolute: true,
		}
	);

	await Promise.all(
		files.map((file) => fs.remove(file))
	);

	console.log(
		chalk.yellow(
			'✔ Cleaned minified assets'
		)
	);
};

/**
 * Get output path
 */
const getOutputPath = (
	file,
	parsed,
	type
) => {
	const config = ASSETS[type];

	const scope = file.startsWith(
		'public/'
	)
		? 'public'
		: file.match(
				/^modules\/([^/]+)\//
		  )?.[1];

	if (!scope) {
		return null;
	}

	return path.join(
		pluginRoot,
		`assets/${config.output}/${scope === 'public' ? 'public' : `modules/${scope}`}/${name}-${parsed.name}.min.${config.extension || type}`
	);
};

/**
 * Process asset
 */
const processFile = async (file) => {
	const normalizedFile =
		file.replace(/\\/g, '/');

	const parsed =
		path.parse(normalizedFile);

	const type =
		parsed.ext.replace('.', '');

	const config = ASSETS[type];

	if (!config) {
		return;
	}

	const outputPath = getOutputPath(
		normalizedFile,
		parsed,
		type
	);

	if (!outputPath) {
		return;
	}

	const output =
		await config.minify(
			path.join(
				pluginRoot,
				normalizedFile
			)
		);

	await fs.ensureDir(
		path.dirname(outputPath)
	);

	await fs.outputFile(
		outputPath,
		output
	);

	console.log(
		chalk.green(
			`✔ ${normalizedFile}`
		)
	);

	console.log(
		chalk.cyan(
			`  → ${path.relative(
				pluginRoot,
				outputPath
			)}`
		)
	);
};

/**
 * Build assets
 */
(async () => {
	try {
		await cleanAssets();

		const assetFolders = [
			'public/js',
			'public/styles',

			...(await glob(
				'modules/*/assets/{js,styles}',
				{
					cwd: pluginRoot,
				}
			)),
		];

		for (const folder of assetFolders) {
			const normalizedFolder =
				folder.replace(/\\/g, '/');

			const files = await glob(
				`${normalizedFolder}/**/*.{js,scss}`,
				{
					cwd: pluginRoot,
					ignore: [
						'**/*.min.*',
						'**/_*.scss',
					],
				}
			);

			await Promise.all(
				files.map(async (file) => {
					try {
						await processFile(
							file
						);
					} catch (error) {
						console.log(
							chalk.red(
								`✖ Failed ${file}`
							)
						);

						console.error(
							error
						);
					}
				})
			);
		}

		console.log(
			chalk.bold.green(
				'\n✔ Asset build completed\n'
			)
		);
	} catch (error) {
		console.error(
			chalk.bold.red(
				'\n✖ Build failed\n'
			)
		);

		console.error(error);

		process.exit(1);
	}
})();