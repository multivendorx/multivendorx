const path = require( "path" );
const MiniCssExtractPlugin = require( "mini-css-extract-plugin" );

module.exports = {
    entry: {
        index: "./src/index.tsx",
    },

    output: {
        path: path.resolve( __dirname, "assets" ),
        filename: "js/[name].js",
    },

    watchOptions: {
        ignored: /node_modules/,
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                include: path.resolve( __dirname, "./src" ),
            },
            {
                test: /\.css$/,
                use: [ "style-loader", "css-loader" ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: "asset/resource", // ✅ Replace file-loader with Webpack 5's built-in handling
                generator: {
                    filename: "images/[name][hash][ext]", // ✅ Output folder and name pattern
                },
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader, // 🔄 Replaces 'style-loader'
                    {
                        loader: "css-loader",
                        options: {
                            url: true,
                            importLoaders: 2,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [ require( "autoprefixer" ) ],
                            },
                        },
                    },
                    "sass-loader",
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot|otf|svg)$/i,
                type: "asset/resource",
                generator: {
                    filename: "fonts/[name][hash][ext][query]",
                },
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin( {
            filename: "[name].css",
        } ),
    ],

    resolve: {
        extensions: [ ".ts", ".tsx", ".js", ".jsx" ],
        modules: [ "node_modules" ],
        alias: {
            "@": path.resolve( __dirname, "./src" ), // So you can use "@/assets/..." in SCSS or imports
        },
    },

    externals: {
        react: "React",
        "react-dom": "ReactDOM",
    },
};
