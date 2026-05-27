const defaultConfig = require(
	'@wordpress/scripts/config/webpack.config'
);

const path = require('path');

const fs = require('fs');

const MiniCssExtractPlugin = require(
	'mini-css-extract-plugin'
);

const DependencyExtractionWebpackPlugin = require(
	'@wordpress/dependency-extraction-webpack-plugin'
);

const CopyWebpackPlugin = require(
	'copy-webpack-plugin'
);

/**
 * Generate dynamic Gutenberg block entries
 */
function generateBlockEntries(rootDir) {
	const blockBasePath = path.resolve(
		rootDir,
		'src/blocks'
	);

	if (!fs.existsSync(blockBasePath)) {
		return {};
	}

	const blockDirs = fs
		.readdirSync(blockBasePath, {
			withFileTypes: true,
		})
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	const entries = {};

	for (const blockName of blockDirs) {
		const indexFile = path.join(
			blockBasePath,
			blockName,
			'index.js'
		);

		if (fs.existsSync(indexFile)) {
			entries[
				`block/${blockName}/index`
			] = indexFile;
		}
	}

	return entries;
}

/**
 * Generate dynamic block asset copy patterns
 */
function generateBlockPatterns(rootDir) {
	const blockBasePath = path.resolve(
		rootDir,
		'src/blocks'
	);

	if (!fs.existsSync(blockBasePath)) {
		return [];
	}

	const blockDirs = fs
		.readdirSync(blockBasePath, {
			withFileTypes: true,
		})
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	return blockDirs.flatMap((blockName) => {
		const blockPath = path.join(
			blockBasePath,
			blockName
		);

		const outPath = path.resolve(
			rootDir,
			'assets/js/block',
			blockName
		);

		const patterns = [];

		// block.json
		if (
			fs.existsSync(
				path.join(
					blockPath,
					'block.json'
				)
			)
		) {
			patterns.push({
				from: path.join(
					blockPath,
					'block.json'
				),
				to: path.join(
					outPath,
					'block.json'
				),
			});
		}

		// render.php
		if (
			fs.existsSync(
				path.join(
					blockPath,
					'render.php'
				)
			)
		) {
			patterns.push({
				from: path.join(
					blockPath,
					'render.php'
				),
				to: path.join(
					outPath,
					'render.php'
				),
			});
		}

		return patterns;
	});
}

module.exports = function createWebpackConfig(
	rootDir
) {
	const dynamicEntries =
		generateBlockEntries(rootDir);

	const dynamicPatterns =
		generateBlockPatterns(rootDir);

	return {
		...defaultConfig,

		entry: {
			index: path.resolve(
				rootDir,
				'./src/index.tsx'
			),

			...dynamicEntries,
		},

		output: {
			...defaultConfig.output,

			path: path.resolve(
				rootDir,
				'assets'
			),

			filename: 'js/[name].js',

			chunkFilename:
				'chunks/[name].[contenthash].js',

			clean: false,
		},

		optimization: {
			...defaultConfig.optimization,

			splitChunks: {
				chunks: 'all',

				minSize: 20000,

				maxInitialRequests: 5,

				maxAsyncRequests: 5,

				cacheGroups: {
					default: false,

					vendors: {
						test: /[\\/]node_modules[\\/]/,

						name: 'vendors',

						priority: -10,

						reuseExistingChunk: true,
					},
				},
			},

			runtimeChunk: false,
		},

		watchOptions: {
			ignored: /node_modules/,
		},

		module: {
			...defaultConfig.module,

			rules: [
				{
					test: /\.html$/i,

					type: 'asset/source',
				},

				{
					test: /\.tsx?$/,

					exclude: /node_modules/,

					use: {
						loader: 'ts-loader',

						options: {
							transpileOnly: true,
						},
					},
				},

				{
					test: /\.(t|j)sx?$/,

					exclude:
						/[\\/]node_modules[\\/]/,

					use: {
						loader: 'babel-loader',

						options: {
							presets: [
								'@wordpress/babel-preset-default',
							],

							cacheDirectory:
								path.resolve(
									rootDir,
									'.cache/babel'
								),

							cacheCompression: false,
						},
					},
				},

				{
					test: /\.css$/,

					use: [
						'style-loader',
						'css-loader',
					],
				},

				{
					test: /\.(png|jpe?g|gif|svg)$/i,

					type: 'asset/resource',

					generator: {
						filename:
							'images/[name][hash][ext]',
					},
				},

				{
					test: /\.scss$/,

					use: [
						MiniCssExtractPlugin.loader,

						{
							loader: 'css-loader',

							options: {
								url: true,

								importLoaders: 2,
							},
						},

						{
							loader:
								'postcss-loader',

							options: {
								postcssOptions: {
									plugins: [
										require(
											'autoprefixer'
										),
									],
								},
							},
						},

						'sass-loader',
					],
				},

				{
					test: /\.(woff(2)?|ttf|eot|otf|svg)$/i,

					type: 'asset/resource',

					generator: {
						filename:
							'fonts/[name][hash][ext][query]',
					},
				},
			],
		},

		plugins: [
			new MiniCssExtractPlugin({
				filename:
					'styles/[name].css',
			}),

			new DependencyExtractionWebpackPlugin({
				outputFormat: 'php',

				injectPolyfill: true,
			}),

			new CopyWebpackPlugin({
				patterns: [
					/**
					 * Copy ONLY public images
					 *
					 * public/images/*
					 * →
					 * assets/images/public/*
					 */
					{
						from: path.resolve(
							rootDir,
							'public/images'
						),

						to: path.resolve(
							rootDir,
							'assets/images/public'
						),

						noErrorOnMissing: true,
					},

					...dynamicPatterns,
				],
			}),
		],

		resolve: {
			extensions: [
				'.ts',
				'.tsx',
				'.js',
				'.jsx',
			],

			modules: ['node_modules'],

			alias: {
				'@': path.resolve(
					rootDir,
					'./src'
				),
			},
		},

		externals: {
			react: 'React',
			'react-dom': 'ReactDOM',
			'@wordpress/element': ['wp', 'element'],
			'@wordpress/i18n': ['wp', 'i18n'],
			'@wordpress/components': ['wp', 'components'],
			'@wordpress/data': ['wp', 'data'],
			'@wordpress/hooks': ['wp', 'hooks'],
			'@wordpress/plugins': ['wp', 'plugins'],
			'@wordpress/blocks': ['wp', 'blocks'],
			'@wordpress/block-editor': ['wp', 'blockEditor'],
		},
	};
};