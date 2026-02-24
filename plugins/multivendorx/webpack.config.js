const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

// Dynamically get block folders inside src/block/
// 1. Static copy pattern for fonts
const staticPatterns = [
	{
		from: path.resolve(__dirname, 'node_modules/zyra/build/assets/fonts'),
		to: path.resolve(__dirname, 'dist/fonts'),
	},
];

// 2. Dynamic block.json + render.php copy patterns
const blockBasePath = path.resolve(__dirname, 'src/blocks');
const blockDirs = fs
	.readdirSync(blockBasePath, { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory())
	.map((dirent) => dirent.name);

const dynamicPatterns = blockDirs.flatMap((blockName) => {
	const blockPath = path.join(blockBasePath, blockName);
	const outPath = path.resolve(
		__dirname,
		'release/assets/js/block',
		blockName
	);

	const patterns = [];

	if (fs.existsSync(path.join(blockPath, 'block.json'))) {
		patterns.push({
			from: path.join(blockPath, 'block.json'),
			to: path.join(outPath, 'block.json'),
		});
	}

	if (fs.existsSync(path.join(blockPath, 'render.php'))) {
		patterns.push({
			from: path.join(blockPath, 'render.php'),
			to: path.join(outPath, 'render.php'),
		});
	}

	return patterns;
});

module.exports = {
	...defaultConfig,

	entry: {
		index: './src/index.tsx',
		'block/registration-form/index':
			'./src/blocks/registration-form/index.js',
		'block/marketplace-stores/index': './src/blocks/marketplace-stores/index.js',
		'block/marketplace-products/index': './src/blocks/marketplace-products/index.js',
		'block/setup-wizard/index': './src/blocks/setup-wizard/index.js',
		'block/store-coupons/index': './src/blocks/store-coupons/index.js',
		'block/store-tabs/index': './src/blocks/store-tabs/index.js',
		'block/contact-info/index': './src/blocks/contact-info/index.js',
		'block/store-name/index': './src/blocks/store-name/index.js',
		'block/store-email/index': './src/blocks/store-email/index.js',
		'block/store-address/index': './src/blocks/store-address/index.js',
		'block/store-engagement-tools/index': './src/blocks/store-engagement-tools/index.js',
		'block/store-phone/index': './src/blocks/store-phone/index.js',
		'block/store-logo/index': './src/blocks/store-logo/index.js',
		'block/store-social-icons/index': './src/blocks/store-social-icons/index.js',
		'block/store-banner/index': './src/blocks/store-banner/index.js',
		'block/store-description/index': './src/blocks/store-description/index.js',
		'block/store-review/index': './src/blocks/store-review/index.js',
		'block/store-policy/index': './src/blocks/store-policy/index.js',
		'block/highlighted-store-products/index': './src/blocks/highlighted-store-products/index.js',
		'block/product-category/index': './src/blocks/product-category/index.js',
		'block/store-quick-info/index': './src/blocks/store-quick-info/index.js',
		'block/store-sidebar/index': './src/blocks/store-sidebar/index.js',
	},

	output: {
		...defaultConfig.output,
		path: path.resolve(__dirname, 'release/assets'),
		filename: 'js/[name].js',
		chunkFilename: 'chunks/[name].[contenthash].js',
		clean: false,
	},

	optimization: {
		...defaultConfig.optimization,
		splitChunks: {
			chunks: 'all',
			minSize: 0,
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					name(module) {
						const path = module.context;
						const match = path.match(
							/[\\/]node_modules[\\/](?:\.pnpm[\\/])?((@[^\\/]+[\\/][^\\/]+)|([^\\/]+))/
						);
						if (!match) return 'externals/vendor-unknown';
						const raw = match[2] || match[3];
						return `externals/vendor-${raw.replace(
							/[\\/@]/g,
							'-'
						)}`;
					},
					chunks: 'all',
					priority: -10,
					reuseExistingChunk: true,
				},
				components: {
					test: /[\\/]src[\\/]components[\\/]/,
					name: 'components',
					minChunks: 1,
					priority: 10,
					reuseExistingChunk: true,
				},
			},
		},
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
				exclude: /[\\/]node_modules[\\/]/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@wordpress/babel-preset-default'],
						cacheDirectory: path.resolve(__dirname, '.cache/babel'),
						cacheCompression: false,
					},
				},
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				type: 'asset/resource', // ✅ Replace file-loader with Webpack 5's built-in handling
				generator: {
					filename: 'images/[name][hash][ext]', // ✅ Output folder and name pattern
				},
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader, // 🔄 Replaces 'style-loader'
					{
						loader: 'css-loader',
						options: {
							url: true,
							importLoaders: 2,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [require('autoprefixer')],
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
					filename: 'fonts/[name][hash][ext][query]',
				},
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'styles/[name].css',
		}),
		new DependencyExtractionWebpackPlugin({
			outputFormat: 'php',
			injectPolyfill: true,
		}),
		new CopyWebpackPlugin({
			patterns: [...staticPatterns, ...dynamicPatterns],
		}),
	],

	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		modules: ['node_modules'],
		alias: {
			'@': path.resolve(__dirname, './src'), // So you can use "@/assets/..." in SCSS or imports
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
