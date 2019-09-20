class Sandbox {
	constructor(v = "Defualt") {
		console.log(1111, v);
		this.v_ = v;
	}

	// a is array
	// s is string
	// z is stream
	play(z) {
		console.log(2222, z);
		z.push(this.one());
	}

	one() {
		return ("a" + 1 + 1.0 + "asdf").split("").map(each => each.toUpperCase()).filter(function (each) {
			return each > "A";
		}).join("--");
	}
}

export {Sandbox};