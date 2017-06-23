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

	it('stores provided individual array and settings object', function() {
		let individuals = [ new Individual('foo'), new Individual('bar') ];
		let settings = { foo: 'bar' };

		let generation = new Generation(individuals, settings);

		expect(generation.individuals).to.equal(individuals);
		expect(generation.settings).to.equal(settings);
	});

	it('defaults to an empty individual array and settings object', function() {
		let generation = new Generation();

		expect(generation.individuals).to.deep.equal([]);
		expect(generation.settings).to.deep.equal({});
	});

	describe('#add', function() {
		let foo, bar, baz, generation;

		beforeEach(function() {
			foo = new Individual('foo');
			bar = new Individual('bar');
			baz = new Individual('baz');
			generation = new Generation([ foo ]);
		});

		it('pushes provided individual onto individuals array', function() {
			generation.add(bar);

			expect(generation.individuals).to.deep.equal([ foo, bar ]);
		});

		it('supports multiple arguments', function() {
			generation.add(bar, baz);

			expect(generation.individuals).to.deep.equal([ foo, bar, baz ]);
		});
	});

	describe('#getSample', function() {
		let generation, sample;

		beforeEach(function() {
			let foo = new Individual('foo');
			let bar = new Individual('bar');
			let baz = new Individual('baz');

			generation = new Generation([ foo, bar, baz ]);
			sample = [ foo, bar ];

			sandbox.stub(_, 'sampleSize').returns(sample);
		});

		it('returns a random subset of settings.sampleSize', function() {
			generation.settings.sampleSize = 1;

			let result = generation.getSample();

			expect(_.sampleSize).to.be.calledOnce;
			expect(_.sampleSize).to.be.calledOn(_);
			expect(_.sampleSize).to.be.calledWith(
				generation.individuals,
				generation.settings.sampleSize
			);
			expect(result).to.equal(sample);
		});

		it('defaults to sample size of 2', function() {
			let result = generation.getSample();

			expect(_.sampleSize).to.be.calledOnce;
			expect(_.sampleSize).to.be.calledOn(_);
			expect(_.sampleSize).to.be.calledWith(generation.individuals, 2);
			expect(result).to.equal(sample);
		});
	});

	describe('#select', function() {
		let generation;

		beforeEach(function() {
			generation = new Generation();
			sandbox.stub(generation, 'getSample');
		});

		it('returns highest-scoring individual from a random sample', function() {
			let foo = new Individual('foo');
			let bar = new Individual('bar');
			let baz = new Individual('baz');
			sandbox.stub(foo, 'getFitnessScore').returns(8);
			sandbox.stub(bar, 'getFitnessScore').returns(10);
			sandbox.stub(baz, 'getFitnessScore').returns(9);
			generation.getSample.returns([ foo, bar, baz ]);

			let result = generation.select();

			expect(generation.getSample).to.be.calledOnce;
			expect(generation.getSample).to.be.calledOn(generation);
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

			expect(generation.select()).to.be.null;
		});
	});

	describe('#getUnmutatedOffspring', function() {
		let settings, generation, foo, bar, fooBar, barFoo;

		beforeEach(function() {
			settings = { crossoverRate: 0.7 };
			generation = new Generation([], settings);
			foo = new Individual('foo');
			bar = new Individual('bar');
			fooBar = new Individual('foo-bar');
			barFoo = new Individual('bar-foo');

			sandbox.stub(generation, 'select')
				.onFirstCall().returns(foo)
				.onSecondCall().returns(bar);

			sandbox.stub(foo, 'crossover').returns([ fooBar, barFoo ]);
		});

		it('creates offspring from two selected mates', function() {
			let result = generation.getUnmutatedOffspring();

			expect(generation.select).to.be.calledTwice;
			expect(generation.select).to.always.be.calledOn(generation);
			expect(foo.crossover).to.be.calledOnce;
			expect(foo.crossover).to.be.calledOn(foo);
			expect(foo.crossover).to.be.calledWith(bar, settings.crossoverRate);
			expect(result).to.deep.equal([ fooBar, barFoo ]);
		});

		it('uses default crossover rate of 0', function() {
			delete settings.crossoverRate;

			let result = generation.getUnmutatedOffspring();

			expect(generation.select).to.be.calledTwice;
			expect(generation.select).to.always.be.calledOn(generation);
			expect(foo.crossover).to.be.calledOnce;
			expect(foo.crossover).to.be.calledOn(foo);
			expect(foo.crossover).to.be.calledWith(bar, 0);
			expect(result).to.deep.equal([ fooBar, barFoo ]);
		});

		it('returns single offspring in an array', function() {
			foo.crossover.returns(fooBar);

			let result = generation.getUnmutatedOffspring();

			expect(generation.select).to.be.calledTwice;
			expect(generation.select).to.always.be.calledOn(generation);
			expect(foo.crossover).to.be.calledOnce;
			expect(foo.crossover).to.be.calledOn(foo);
			expect(foo.crossover).to.be.calledWith(bar, settings.crossoverRate);
			expect(result).to.deep.equal([ fooBar ]);
		});
	});

	describe('#getOffspring', function() {
		let settings, generation, foo, bar, fooPrime, barPrime;

		beforeEach(function() {
			settings = { mutationRate: 0.1 };
			generation = new Generation([], settings);
			foo = new Individual('foo');
			bar = new Individual('bar');
			fooPrime = new Individual('foo-prime');
			barPrime = new Individual('bar-prime');

			sandbox.stub(generation, 'getUnmutatedOffspring')
				.returns([ foo, bar ]);

			sandbox.stub(foo, 'mutate').returns(fooPrime);
			sandbox.stub(bar, 'mutate').returns(barPrime);
		});

		it('returns mutated offspring', function() {
			let result = generation.getOffspring();

			expect(generation.getUnmutatedOffspring).to.be.calledOnce;
			expect(generation.getUnmutatedOffspring).to.be.calledOn(generation);
			expect(foo.mutate).to.be.calledOnce;
			expect(foo.mutate).to.be.calledOn(foo);
			expect(foo.mutate).to.be.calledWith(settings.mutationRate);
			expect(bar.mutate).to.be.calledOnce;
			expect(bar.mutate).to.be.calledOn(bar);
			expect(bar.mutate).to.be.calledWith(settings.mutationRate);
			expect(result).to.deep.equal([ fooPrime, barPrime ]);
		});

		it('uses default mutation rate of 0', function() {
			delete settings.mutationRate;

			let result = generation.getOffspring();

			expect(generation.getUnmutatedOffspring).to.be.calledOnce;
			expect(generation.getUnmutatedOffspring).to.be.calledOn(generation);
			expect(foo.mutate).to.be.calledOnce;
			expect(foo.mutate).to.be.calledOn(foo);
			expect(foo.mutate).to.be.calledWith(0);
			expect(bar.mutate).to.be.calledOnce;
			expect(bar.mutate).to.be.calledOn(bar);
			expect(bar.mutate).to.be.calledWith(0);
			expect(result).to.deep.equal([ fooPrime, barPrime ]);
		});
	});

	describe('#getNextGeneration', function() {
		it('returns an empty generation with copied settings', function() {
			let settings = { foo: 'bar' };
			let generation = new Generation(
				[ new Individual('baz') ],
				settings
			);

			let result = generation.getNextGeneration();

			expect(result).to.be.an.instanceof(Generation);
			expect(result.individuals).to.deep.equal([]);
			expect(result.settings).to.deep.equal(settings);
			expect(result.settings).to.not.equal(settings);
		});
	});
});
