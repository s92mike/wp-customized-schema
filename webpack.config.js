const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );
const path = require( 'path' );
module.exports = ( env ) => {
	return [
		{
			...defaultConfig,
			module: {
				...defaultConfig.module,
				rules: [ ...defaultConfig.module.rules ],
			},
			mode: env.mode,
			devtool: 'source-map',
		},
		{
			entry: {
				// 'template-sidebar': './src/TemplateSidebar/index.js',
			},
			mode: env.mode,
			devtool: 'source-map',
			output: {
				filename: '[name].js',
				sourceMapFilename: '[file].map[query]',
				clean: true,
			},
	  resolve: {
				alias: {
					react: path.resolve( 'node_modules/react' ),
					React: path.resolve( 'node_modules/react' ),
					'react-dom': path.resolve( 'node_modules/react-dom' ),
					ReactDOM: path.resolve( 'node_modules/react-dom' ),
					'react-dom/client': path.resolve( 'node_modules/react-dom/client' ),
				},
	 },
			module: {
				rules: [
					{
						test: /\.(js|jsx)$/,
						type: 'javascript/auto',
						exclude: /(node_modules|bower_components)/,
						loader: 'babel-loader',
						options: {
							presets: [ '@babel/preset-env', '@babel/preset-react' ],
							plugins: [
								'@babel/plugin-proposal-class-properties',
								'@babel/plugin-transform-arrow-functions',
							],
						},
					},
					{
						test: /\.scss$/,
						exclude: /(node_modules|bower_components)/,
						use: [
							{
								loader: MiniCssExtractPlugin.loader,
							},
							{
								loader: 'css-loader',
								options: {
									sourceMap: true,
								},
							},
							{
								loader: 'resolve-url-loader',
							},
							{
								loader: 'sass-loader',
								options: {
									sourceMap: true,
								},
							},
						],
					},
				],
			},
			plugins: [ new RemoveEmptyScriptsPlugin(), new MiniCssExtractPlugin() ],
		},
	];
};
