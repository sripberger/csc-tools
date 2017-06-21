const _ = require('lodash');

class Generation {
	constructor(individuals = []) {
		this.individuals = individuals;
	}

	getSample(size) {
		return _.sampleSize(this.individuals, size);
	}

	select(sampleSize) {
		let sample = this.getSample(sampleSize);
		return _.maxBy(sample, (i) => i.getFitnessScore()) || null;
	}

	getOffspring(options) {
		let { sampleSize, crossoverRate, mutationRate } = options;
		let leftParent = this.select(sampleSize);
		let rightParent = this.select(sampleSize);
		let crossover = leftParent.crossover(rightParent, crossoverRate);
		let children = (_.isArray(crossover)) ? crossover : [ crossover ];
		return _.map(children, (c) => c.mutate(mutationRate));
	}
}

module.exports = Generation;
