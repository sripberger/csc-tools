class RankList {
	constructor(ranks = []) {
		this.ranks = ranks;
	}

	shuffle() {
		return new RankList(this.ranks.map((rank) => rank.shuffle()));
	}

	mutate(rate) {
		return new RankList(this.ranks.map((rank) => rank.mutate(rate)));
	}
}

module.exports = RankList;
