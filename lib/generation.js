const _ = require('lodash');

class Generation {
	constructor(individuals = [], settings = {}) {
		this.individuals = individuals;
		this.settings = settings;
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
}

module.exports = Generation;
