const _ = require('lodash');
const RankList = require('./rank-list');
const utils = require('./utils');
const Tournament = require('./tournament');

/**
 * Responsible for generating Tournament instances with calculated settings.
 * Note that the results of many settings calculations are cached. As a result,
 * instances of this class should not be changed once created.
 * @private
 * @param {RankList} rankList Prototype RankList instance.
 * @param {number} [poolCount = 1] number of tournament pools.
 */
class TournamentGenerator {
	constructor(rankList = new RankList(), poolCount = 1) {
		this.rankList = rankList;
		this.poolCount = poolCount;
	}

	/**
	 * Creates an instance populated with a given array of players.
	 * @param {Array<Object>} players Array of player objects, each with a
	 *   numeric rank property and a string region property.
	 * @param {number} [poolCount = 1] number of tournament pools.
	 * @returns {TournamentGenerator} Instance with a prototype RankList
	 *   containing the provided players.
	 */
	static create(players, poolCount) {
		return new TournamentGenerator(RankList.create(players), poolCount);
	}

	/**
	 * Counts the number of players in each region.
	 * @returns {Object} Plain object map from region strings to the number of
	 *    players with that same region string.
	 */
	getRegionCounts() {
		if (!this._regionCounts) {
			let players = [...this.rankList.seedOrder()];
			this._regionCounts = utils.getRegionCounts(players);
		}
		return this._regionCounts;
	}

	/**
	 * Returns the smallest possible collision score based on the pool count
	 * and the number of players in each region. This will be used as the
	 * target collision score for the genetic algorithm.
	 * @return {number} Minimum collision score.
	 */
	getMinimumCollisionScore() {
		if (!_.isNumber(this._minimumCollisionScore)) {
			this._minimumCollisionScore = utils.getMinimumCollisionScore(
				this.getRegionCounts(),
				this.poolCount
			);
		}
		return this._minimumCollisionScore;
	}

	/**
	 * Returns a settings object to be used by generated Tournament instances.
	 * @return {Object} - Plain object containing poolCount, and
	 *   targetCollisionScore properties.
	 */
	getTournamentSettings() {
		if (!this._tournamentSettings) {
			this._tournamentSettings = {
				poolCount: this.poolCount,
				targetCollisionScore: this.getMinimumCollisionScore()
			};
		}
		return this._tournamentSettings;
	}

	/**
	 * Generates a Tournament instance with the players in each rank shuffled.
	 * Generated Tournaments will all use the same calculated settings object.
	 * @returns {Tournament} Generated Tournament instance.
	 */
	generateTournament() {
		return new Tournament(
			this.rankList.shuffle(),
			this.getTournamentSettings()
		);
	}
}

module.exports = TournamentGenerator;
