class RankList {
	constructor(ranks = []) {
		this.ranks = ranks;
	}

	shuffle() {
		return new RankList(this.ranks.map((rank) => rank.shuffle()));
	}
}

module.exports = RankList;
