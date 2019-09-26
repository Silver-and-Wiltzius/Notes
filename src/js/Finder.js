import $ from "jquery";
import _ from "lodash";

class FinderColumn {
	//========================================================
	// initialize
	//========================================================
	constructor(iIndex, asKeys, sSelectedKey) {
		// fEventColumnSelected(iIndex, sKey)
		this.index_ = iIndex;
		this.keys_ = asKeys;
		this.selectedKey_ = sSelectedKey;
		this.name_ = "FinderColumn";
	}

	renderOn($finder) {
		let elementsString = "";
		this.keys_.forEach((each, index) => {
			let classString = "";
			if (each === this.selectedKey_) {
				classString = "class=\"selected\"";
			}
			elementsString += `<li ${classString} data-column-index="${this.index_}" data-key-index="${index}">${each}</li>`;
		});
		const columnString = `<div class="FinderColumn"><ul>${elementsString}</ul></div>`;
		$finder.append(columnString);
	}
}

export default class Finder {
	//========================================================
	// initialize
	//========================================================
	constructor(sId, $container, zPaths, zSelectedPath) {
		this.id_ = sId;
		this.container_ = $container;
		this.pathsStream_ = zPaths;
		this.selectedPathStream_ = zSelectedPath;
		this.pathsStream_.onValue(v => {
			this.render();
		});
		this.selectedPathStream_.onValue(v => {
			this.render();
		});
	}

	//========================================================
	// events
	//========================================================
	eventElementSelectedLogic(iIndex, sKey) {
		const oldPath = this.columns_.map(each => each.selectedKey_);
		const newPartialPath = oldPath.slice(0, iIndex);
		newPartialPath.push(sKey);
		const newTempColumns = this.getColumns(this.pathsStream_.value(), newPartialPath);
		const newFullExtendedPath = newTempColumns.map(each => each.selectedKey_);
		const newFullPath = newFullExtendedPath.filter(each => !(each === "----"));
		this.selectedPathStream_.uPush(newFullPath);
	}

	eventElementSelected(oJQueryEvent) {
		const element = oJQueryEvent.target;
		this.eventElementSelectedLogic(element.dataset.columnIndex, element.textContent);
	}

	render() {
		this.renderOn(this.container_);
	}

	renderOn($container) {
		let $finder = $(`#${this.id_}`);
		if ($finder.length) {
			// exists
			$finder.empty();
		} else {
			// does not exist
			$finder = $(`<div id="${this.id_}" class="Finder"></div>`);
			$container.prepend($finder);
			const handler = this.eventElementSelected.bind(this);
			// https://api.jquery.com/on/
			// https://stackoverflow.com/questions/16383718/are-there-any-drawbacks-to-listen-events-on-document-level-in-jquery
			$finder.on("click", `li`, handler);
		}
		this.columns_ = this.getColumns(this.pathsStream_.value([]), this.selectedPathStream_.value([]), 0);
		this.columns_.forEach((each) => each.renderOn($finder));
	}

	//================================================
	// path utility
	// static for testing without react
	//================================================
	getColumns(...args) {
		return this.constructor.getColumns(...args);
	}

	static asExtendPaths(aasPaths) {
		// return copies, with some of them extended
		const result = [];
		const sorted = _.sortBy(aasPaths);
		for (let i = 0; i < sorted.length; i++) {
			let currentCopy = sorted[i].slice();
			let next = sorted[i + 1];
			if (next && (_.isEqual(currentCopy, next.slice(0, currentCopy.length)))) {
				currentCopy.push("----");
			}
			result.push(currentCopy);
		}
		return result;
	}

	static getColumns(aasPaths, asPath, index = 0) {
		// if (index === 0) {
		// 	console.log(9999, "getColumns", asPath);
		// }
		//count is used in recursive calls to avoid infinite loops from errors
		if (index > 20) {
			return ["INFINITE LOOP ERROR"];
		}
		//if there are no paths, there are no columns
		if (aasPaths.length === 0) {
			return [];
		}
		//extend the paths
		const paths = this.asExtendPaths(aasPaths);
		//get the first column
		const firstKeys = paths.map(function (each) {
			return each[0];
		});
		const uniqueFirstKeys = Array.from(new Set(firstKeys)).sort();
		let firstSelected;
		if (asPath.length > 0 && uniqueFirstKeys.includes(asPath[0])) {
			firstSelected = asPath[0];
		} else {
			firstSelected = uniqueFirstKeys[0];
		}
		const firstColumn = new FinderColumn(index, uniqueFirstKeys, firstSelected);
		//recursively get the rest of the columns
		let restColumns = [];
		const restPaths = paths.filter(function (each) {
			return each[0] === firstSelected;
		}).filter(function (each) {
			return each.length > 1;
		}).map(function (each) {
			return each.slice(1);
		});
		if (restPaths.length > 0) {
			const restSelected = asPath.slice(1);
			restColumns = this.getColumns(restPaths, restSelected, index + 1);
		}
		//add the first column to the front of the rest of the columns
		const columns = [firstColumn].concat(restColumns);
		//return result
		return columns;
	}

	// =============================
	// Unit Tests
	// =============================
	static test_first(t) {
		t.eq(1, 1);
	}

	static test_getColumns(t) {
		const columns = Finder.getColumns([[1, 2, 3], [1, 2, 4], [1, 5, 6], [7, 8, 9]], [1]);
		const resultJSON = JSON.stringify(columns, ["keys", "selected"]);
		const desired = "[{\"keys\":[1,7],\"selected\":1},{\"keys\":[2,5],\"selected\":2},{\"keys\":[3,4],\"selected\":3}]";
		t.eq(resultJSON, desired);
	}
}