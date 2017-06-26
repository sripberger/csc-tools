const _ = require('lodash');

class Generation {
	constructor(settings = {}) {
		this.settings = settings;
		this.individuals = [];
	}

	add(...individuals) {
		this.individuals.push(...individuals);
	}

	getSize() {
		return this.individuals.length;
	}

	getBest() {
		return _.maxBy(this.individuals, (i) => i.getFitnessScore()) || null;
	}

	getSample() {
		return _.sampleSize(this.individuals, this.settings.sampleSize || 2);
	}

	select() {
		return _.maxBy(this.getSample(), (i) => i.getFitnessScore()) || null;
	}

	getUnmutatedOffspring() {
		let leftParent = this.select();
		let rightParent = this.select();
		let crossoverRate = this.settings.crossoverRate || 0;
		let offspring =  leftParent.crossover(rightParent, crossoverRate);
		return (_.isArray(offspring)) ? offspring : [ offspring ];
	}

	getOffspring() {
		let offspring = this.getUnmutatedOffspring();
		let mutationRate = this.settings.mutationRate || 0;
		return _.map(offspring, (o) => o.mutate(mutationRate));
	}

	getNextGeneration() {
		return new Generation(_.clone(this.settings));
	}
}

module.exports = Generation;
