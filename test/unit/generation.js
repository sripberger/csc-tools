const Generation = require('../../lib/generation');
const sinon = require('sinon');
const XError = require('xerror');
const _ = require('lodash');

// Simple Individual class for testing purposes.
class Individual {
	constructor(id) {
		this.id = id;
	}

	getFitnessScore() {
		throw new XError(XError.NOT_IMPLEMENTED);
	}

	crossover() {
		throw new XError(XError.NOT_IMPLEMENTED);
	}

	mutate() {
		throw new XError(XError.NOT_IMPLEMENTED);
	}
}

describe('Generation', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('stores provided array of individuals', function() {
		let individuals = [ new Individual('foo'), new Individual('bar') ];

		let generation = new Generation(individuals);

		expect(generation.individuals).to.equal(individuals);
	});

	it('defaults to an empty array of individuals', function() {
		let generation = new Generation();

		expect(generation.individuals).to.deep.equal([]);
	});

	describe('#getSample', function() {
		it('returns a random subset of provided size', function() {
			let foo = new Individual('foo');
			let bar = new Individual('bar');
			let baz = new Individual('baz');
			let generation = new Generation([ foo, bar, baz ]);
			let size = 2;
			let sample = [ foo, bar ];
			sandbox.stub(_, 'sampleSize').returns(sample);

			let result = generation.getSample(size);

			expect(_.sampleSize).to.be.calledOnce;
			expect(_.sampleSize).to.be.calledOn(_);
			expect(_.sampleSize).to.be.calledWith(generation.individuals, size);
			expect(result).to.equal(sample);
		});
	});

	describe('#select', function() {
		const sampleSize = 3;
		let generation;

		beforeEach(function() {
			generation = new Generation();
			sandbox.stub(generation, 'getSample');
		});

		it('returns highest-scoring individual from a sample of provided size', function() {
			let foo = new Individual('foo');
			let bar = new Individual('bar');
			let baz = new Individual('baz');
			sandbox.stub(foo, 'getFitnessScore').returns(8);
			sandbox.stub(bar, 'getFitnessScore').returns(10);
			sandbox.stub(baz, 'getFitnessScore').returns(9);
			generation.getSample.returns([ foo, bar, baz ]);

			let result = generation.select(sampleSize);

			expect(generation.getSample).to.be.calledOnce;
			expect(generation.getSample).to.be.calledWith(sampleSize);
			expect(foo.getFitnessScore).to.be.called;
			expect(foo.getFitnessScore).to.always.be.calledOn(foo);
			expect(bar.getFitnessScore).to.be.called;
			expect(bar.getFitnessScore).to.always.be.calledOn(bar);
			expect(baz.getFitnessScore).to.be.called;
			expect(baz.getFitnessScore).to.always.be.calledOn(baz);
			expect(result).to.equal(bar);
		});

		it('returns null if generation is empty', function() {
			generation.getSample.returns([]);

			expect(generation.select(sampleSize)).to.be.null;
		});
	});

	describe('#getOffspring', function() {
		const sampleSize = 3;
		const crossoverRate = 0.7;
		const mutationRate = 0.1;
		let generation, foo, bar, fooBar, barFoo, fooBarPrime, barFooPrime;

		beforeEach(function() {
			generation = new Generation();
			foo = new Individual('foo');
			bar = new Individual('bar');
			fooBar = new Individual('foo-bar');
			barFoo = new Individual('bar-foo');
			fooBarPrime = new Individual('foo-bar-prime');
			barFooPrime = new Individual('bar-foo-prime');

			sandbox.stub(generation, 'select')
				.onFirstCall().returns(foo)
				.onSecondCall().returns(bar);

			sandbox.stub(foo, 'crossover');

			sandbox.stub(fooBar, 'mutate').returns(fooBarPrime);
			sandbox.stub(barFoo, 'mutate').returns(barFooPrime);
		});

		it('creates offspring from two selected mates', function() {
			foo.crossover.returns([ fooBar, barFoo ]);

			let result = generation.getOffspring({
				sampleSize,
				crossoverRate,
				mutationRate
			});

			expect(generation.select).to.be.calledTwice;
			expect(generation.select).to.always.be.calledOn(generation);
			expect(generation.select).to.always.be.calledWith(sampleSize);
			expect(foo.crossover).to.be.calledOnce;
			expect(foo.crossover).to.be.calledOn(foo);
			expect(foo.crossover).to.be.calledWith(bar, crossoverRate);
			expect(fooBar.mutate).to.be.calledOnce;
			expect(fooBar.mutate).to.be.calledOn(fooBar);
			expect(fooBar.mutate).to.be.calledWith(mutationRate);
			expect(barFoo.mutate).to.be.calledOnce;
			expect(barFoo.mutate).to.be.calledOn(barFoo);
			expect(barFoo.mutate).to.be.calledWith(mutationRate);
			expect(result).to.deep.equal([ fooBarPrime, barFooPrime ]);
		});

		it('supports crossovers that return a single child', function() {
			foo.crossover.returns(fooBar);

			let result = generation.getOffspring({
				sampleSize,
				crossoverRate,
				mutationRate
			});

			expect(generation.select).to.be.calledTwice;
			expect(generation.select).to.always.be.calledOn(generation);
			expect(generation.select).to.always.be.calledWith(sampleSize);
			expect(foo.crossover).to.be.calledOnce;
			expect(foo.crossover).to.be.calledOn(foo);
			expect(foo.crossover).to.be.calledWith(bar, crossoverRate);
			expect(fooBar.mutate).to.be.calledOnce;
			expect(fooBar.mutate).to.be.calledOn(fooBar);
			expect(fooBar.mutate).to.be.calledWith(mutationRate);
			expect(result).to.deep.equal([ fooBarPrime ]);
		});
	});
});
