#!/usr/bin/env node

const _ = require('lodash');
const program = require('commander');
const getStdin = require('get-stdin');
const path = require('path');
const pify = require('pify');
const colors = require('colors');
const cliff = require('cliff');
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
	.description('analyze a player list')
	.option('-r, --show-region-counts', 'Show region counts')
	.option('-p, --show-pools', 'Show pools')
	.action((poolCount, inputPath, options) => {
		poolCount = parsePoolCount(poolCount);
		getPlayers(inputPath)
			.then((players) => {
				let analysis = cscTools.analyze(players, poolCount);
				let base = _.omit(analysis, [ 'pools', 'regionCounts' ]);
				let { pools, regionCounts } = analysis;
				let baseRows = _.map(base, (value, key) => [
					colors.cyan(`${key}:`),
					value
				]);
				let regionCountRows = _.map(regionCounts, (count, region) => [
					colors.cyan(`${region}:`),
					count
				]);

				console.log(cliff.stringifyRows(baseRows));

				if (options.showRegionCounts) {
					console.log(colors.yellow.underline('\nRegion Counts'));
					console.log(cliff.stringifyRows(regionCountRows));
				}

				if (options.showPools) {
					pools.forEach((pool, index) => {
						let { players, collisionScore } = pool;
						let poolLabel = colors.yellow.underline(`Pool ${index + 1}`);
						let scoreStr = `(collisionScore: ${collisionScore})`;
						let playerTable = cliff.stringifyObjectRows(
							players,
							[ 'tag', 'region' ],
							[ 'cyan', 'cyan' ]
						);

						if (collisionScore > 0) {
							scoreStr = colors.red(scoreStr);
						} else {
							scoreStr = colors.green(scoreStr);
						}

						console.log(`\n${poolLabel} ${scoreStr}\n${playerTable}`);
					});
				}
			})
			.catch((err) => {
				console.error(err);
				process.exit(1);
			});
	});

program
	.command('solve <poolCount> [path]')
	.alias('s')
	.description('minimize regional collisions in a player list')
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
