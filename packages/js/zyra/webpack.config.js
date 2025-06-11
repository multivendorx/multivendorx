const path = require( 'path' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

module.exports = {
	entry: {
		index: './src/index.ts',
	},
	mode: 'production',
	output: {
		filename: '[name].js',
		chunkFilename: '[name].[contenthash].js', // ✅ important
		path: path.resolve( __dirname, 'build' ),
		publicPath: './', // or the URL where your assets are served from
		clean: true,
	},

	optimization: {
		splitChunks: {
			chunks: 'async', // ✅ splits dynamic imports
		},
	},

	watchOptions: {
		ignored: /node_modules/,
	},

	module: {
		rules: [
			{
				test: /\.(t|j)sx?$/,
				exclude: /[\\/]node_modules[\\/]/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [ '@wordpress/babel-preset-default' ],
						cacheDirectory: path.resolve(
							__dirname,
							'.cache/babel'
						),
						cacheCompression: false,
					},
				},
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ],
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
								plugins: [ require( 'autoprefixer' ) ],
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
					filename: './fonts/[name][hash][ext][query]',
				},
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin( {
			filename: '[name].css',
		} ),
	],

	resolve: {
		extensions: [ '.ts', '.tsx', '.js', '.jsx' ],
		modules: [ 'node_modules' ],
		alias: {
			'@': path.resolve( __dirname, './src' ), // So you can use "@/assets/..." in SCSS or imports
		},
	},

	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'mapbox-gl': 'mapbox-gl',
	},
};
