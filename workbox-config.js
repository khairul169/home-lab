module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{css,js,png,jpeg,ico,html,json}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};