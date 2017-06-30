const TournamentSelector = require('../../lib/tournament-selector');
const ArraySelector = require('../../lib/array-selector');
const sinon = require('sinon');
const _ = require('lodash');
const Individual = require('../lib/individual');

describe('TournamentSelector', function() {
	it('extends ArraySelector', function() {
		let selector = new TournamentSelector();

		expect(selector).to.be.an.instanceof(ArraySelector);
		expect(selector.settings).to.deep.equal({});
	});

	it('supports settings argument', function() {
		let settings = { foo: 'bar' };

		let selector = new TournamentSelector(settings);

		expect(selector.settings).to.equal(settings);
	});

	describe('#getTournament', function() {
		let selector, sample;

		beforeEach(function() {
			let foo = new Individual('foo');
			let bar = new Individual('bar');
			let baz = new Individual('baz');

			selector = new TournamentSelector();
			sample = [ foo, bar ];

			selector.add(foo, bar, baz );
			sinon.stub(_, 'sampleSize').returns(sample);
		});

		afterEach(function() {
			_.sampleSize.restore();
		});

		it('returns a random subset of settings.sampleSize', function() {
			selector.settings.sampleSize = 1;

			let result = selector.getTournament();

			expect(_.sampleSize).to.be.calledOnce;
			expect(_.sampleSize).to.be.calledOn(_);
			expect(_.sampleSize).to.be.calledWith(
				selector.individuals,
				selector.settings.sampleSize
			);
			expect(result).to.equal(sample);
		});

		it('defaults to sample size of 2', function() {
			let result = selector.getTournament();

			expect(_.sampleSize).to.be.calledOnce;
			expect(_.sampleSize).to.be.calledOn(_);
			expect(_.sampleSize).to.be.calledWith(selector.individuals, 2);
			expect(result).to.equal(sample);
		});
	});
});
