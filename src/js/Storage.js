class Storage {
	constructor(sPrefix = "XXX") {
		this.prefix_ = sPrefix;
	}

	// =========================
	// API
	// =========================
	setItem(sKey, sText, zKeys) {
		localStorage.setItem(this.prefix_ + sKey, sText);
		if (zKeys) {
			zKeys.cuPush(this.getKeys());
		}
		return this;
	}

	getItem(sKey, zResult) {
		const result = localStorage.getItem(this.prefix_ + sKey);
		zResult.cuPush(result);
		return result;
	}

	removeItem(sKey, zKeys) {
		localStorage.removeItem(this.prefix_ + sKey);
		if (zKeys) {
			zKeys.cuPush(this.getKeys());
		}
		return this;
	}

	getKeys() {
		return (Object.keys(localStorage)).filter(each => each.startsWith(this.prefix_)).map(each => this.removePrefix(each, this.prefix_));
	}

	// =========================
	// utility
	// =========================
	removePrefix(s, sPrefix) {
		const regex = new RegExp(`^${sPrefix}`);
		return s.replace(regex, "");
	}

	static test_first(t) {
		t.eq(1, 1);
	}
}

export {Storage};