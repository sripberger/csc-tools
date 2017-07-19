// TODO: Add gene-lib dependency once it is published.
const { Individual } = require('gene-lib');
const RankList = require('./rank-list');
const PoolList = require('./pool-list');

/**
 * Respresents a single possible solution to seeding optimization. Implements
 * gene-lib Individual methods, as well as some convenience methods for output.
 * @private
 * @extends gene-lib.Individual
 * @param {RankList} [rankList=new RankList()] RankList instance containing
 *   players.
 * @param {Object} [settings = {}] Plain settings object.
 *   @param {number} [settings.poolCount=1] Number of tournament Pools.
 *   @param {string} [settings.ignoredRegion] Region to ignore in score
 *     calculations.
 *   @param {number} [settings.targetCollisionScore=0] Collision score which
 *     will be considered a solution to seeding optimization.
 */
class Tournament extends Individual {
	constructor(rankList = new RankList(), settings = {}) {
		super();
		this.rankList = rankList;
		this.settings = settings;
	}

	/**
	 * Returns all players as an array in seed order.
	 * @return {Array<Object>} Array of player objects.
	 */
	getPlayers() {
		return [...this.rankList.seedOrder()];
	}

	/**
	 * Returns players divided into a PoolList with a pool count set by the
	 * settings object.
	 * @returns {PoolList} PoolList instance populated with players in seed
	 *   order.
	 */
	getPoolList() {
		return PoolList.create(
			this.rankList.seedOrder(),
			this.settings.poolCount || 1
		);
	}

	/**
	 * Returns the total collision score of this tournament, assuming the
	 * ignored region from the settings object.
	 * @returns {number} Sum of individual pool collision scores.
	 */
	getCollisionScore() {
		let poolList = this.getPoolList();
		return poolList.getCollisionScore(this.settings.ignoredRegion);
	}

	/**
	 * Returns the fitness score of this tournament, assuming the target
	 * collision score from the settings object. This score is the inverse
	 * of the difference between the actual collision score and the target
	 * collision score, meaning that if the two are equivalent, the fitness
	 * score will be infinity. By default, gene-lib will treat such a
	 * tournament as a solution to the seeding optimization and halt the
	 * genetic algorithm.
	 * @override
	 * @returns {number} Tournament fitness score.
	 */
	calculateFitnessScore() {
		let { targetCollisionScore } = this.settings;
		let diff = this.getCollisionScore() - (targetCollisionScore || 0);
		return 1 / diff;
	}

	/**
	 * Performs a genetic crossover between this tournament and another one.
	 * This does not change either parent, and each child tournament will have
	 * the same settings object as this one.
	 * @override
	 * @param {Tournament} other Another Tournament instance.
	 * @returns {Array<Tournament>} Will contain two new Tournament instances,
	 *   one for each child of the crossover.
	 */
	crossover(other) {
		return this.rankList.crossover(other.rankList)
			.map((rankList) => new Tournament(rankList, this.settings));
	}

	/**
	 * Performs a rate-limited genetic mutation, returning the result as a new
	 * instance with the same settings object. This does not change the original
	 * instance.
	 * @override
	 * @param {number} rate Mutation rate between 0 and 1.
	 * @returns {Tournament} Mutated copy.
	 */
	mutate(rate) {
		return new Tournament(this.rankList.mutate(rate), this.settings);
	}
}

module.exports = Tournament;
