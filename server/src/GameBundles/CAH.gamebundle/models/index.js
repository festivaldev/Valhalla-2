'use strict';

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const models = {};

fs
	// Read all model definition files in the current path
	.readdirSync(__dirname)
	
	// Filter out any files that don't end with '.js' or are the current file
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	
	// Initialize the parsed models
	.forEach(file => {
		const model = require(path.join(__dirname, file));
		models[path.basename(file, ".js")] = model;
	});
	
module.exports = models;