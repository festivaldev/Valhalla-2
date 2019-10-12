module.exports = {
	runtimeCompiler: true,
    configureWebpack: (config) => {
        config.devtool = 'eval-source-map'
    },
};