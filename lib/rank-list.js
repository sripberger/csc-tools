const _ = require('lodash');
const geneLib = require('gene-lib');
const Rank = require('./rank');

/**
 * Represents a list of Rank objects.
 * @private
 * @param {Array<Rank>} [ranks=[]] Array of Rank objects to include in the list.
 */
class RankList {
	constructor(ranks = []) {
		this.ranks = ranks;
	}

	/**
	 * Creates a RankList populated with a given array of players.
	 * @param {Array<Object>} players Array of player objects with numeric
	 *   rank properties.
	 * @returns {RankList} Instance with players divided into its ranks
	 *   according to their rank properties. Ranks will be sorted in ascending
	 *   order.
	 */
	static create(players) {
		let ranks = [];
		let rankValues = _(players).map('rank').uniq().sortBy().value();
		let playersByRank = _.groupBy(players, 'rank');
		for (let rankValue of rankValues) {
			ranks.push(new Rank(playersByRank[rankValue]));
		}
		return new RankList(ranks);
	}

	/**
	 * Iterates players from the list in seed order, starting with the first
	 * rank and continuiong on through each in succession.
	 * @returns {iterable<Object>} Iterate with for...of to get players in seed
	 *   order.
	 */
	seedOrder() {
		let { ranks } = this;
		return { [Symbol.iterator]: function*() {
			for (let rank of ranks) {
				yield* rank.players;
			}
		} };
	}

	/**
	 * Returns a copy with the order of players in each rank shuffled. This
	 * does not change the original instance.
	 * @returns {RankList} Shuffled copy.
	 */
	shuffle() {
		return new RankList(this.ranks.map((rank) => rank.shuffle()));
	}

	/**
	 * Performs a two-point genetic crossover with another RankList. This does
	 * not change either parent.
	 * @param {RankList} other Another RankList instance.
	 * @returns {Array<RankList>} Will contain two new RankList instances, one
	 *   for each child of the crossover.
	 */
	crossover(other) {
		let { length } = this.ranks;
		let [ start, end ] = geneLib.getCrossoverRange(length);
		let results = _.times(2, () => new RankList());
		for (let i = 0; i < length; i += 1) {
			if (_.inRange(i, start, end)) {
				results[0].ranks.push(other.ranks[i]);
				results[1].ranks.push(this.ranks[i]);
			} else {
				results[0].ranks.push(this.ranks[i]);
				results[1].ranks.push(other.ranks[i]);
			}
		}
		return results;
	}

	/**
	 * Performs a rate-limited genetic mutation, returning the result as a
	 * new instance without changing the original.
	 * @param {number} rate Probability of mutating an individual rank.
	 * @returns {RankList} Mutated copy.
	 */
	mutate(rate) {
		return new RankList(this.ranks.map((rank) => {
			return (_.random(0, 1, true) < rate) ? rank.mutate() : rank;
		}));
	}
}

module.exports = RankList;
