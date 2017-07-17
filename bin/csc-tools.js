#!/usr/bin/env node

const _ = require('lodash');
const program = require('commander');
const getStdin = require('get-stdin');
const path = require('path');
const pify = require('pify');
const prettyjson = require('prettyjson');
const readFile = pify(require('fs').readFile);
const csvParse = pify(require('csv-parse'));
const csvStringify = pify(require('csv-stringify'));
const cscTools = require('../lib');
const pkg = require('../package.json');

function parsePoolCount(str) {
	let result = _.parseInt(str);
	if (result > 0) return result;
	console.error('poolCount must be a positive integer');
	process.exit(1);
}

function getInput(inputPath) {
	if (!inputPath) return getStdin();
	return readFile(path.resolve(process.cwd(), inputPath));
}

function getPlayers(inputPath) {
	return getInput(inputPath)
		.then((input) => csvParse(input, { auto_parse: true, columns: true }));
}

program
	.version(pkg.version);

program
	.command('analyze <poolCount> [path]')
	.alias('a')
	.action((poolCount, inputPath) => {
		poolCount = parsePoolCount(poolCount);
		getPlayers(inputPath)
			.then((players) => {
				let analysis = cscTools.analyze(players, poolCount);
				console.log(prettyjson.render(analysis));
			})
			.catch((err) => {
				console.error(err);
				process.exit(1);
			});
	});

program
	.command('solve <poolCount> [path]')
	.alias('s')
	.action((poolCount, inputPath) => {
		poolCount = parsePoolCount(poolCount);
		getPlayers(inputPath)
			.then((players) => {
				let solution = cscTools.solve(players, poolCount);
				return csvStringify(solution, { header: true });
			})
			.then((output) => {
				process.stdout.write(output);
			})
			.catch((err) => {
				console.error(err);
				process.exit(1);
			});
	});

program.parse(process.argv);
