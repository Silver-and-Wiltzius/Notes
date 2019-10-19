import F from "./Factory";
import $ from "jquery";
import moment from "moment";
import {River} from "./River";
import yaml from "js-yaml";

console.log("start index.js");
//
// ===============
// singletons
// ===============
const renderEngine = new F.RenderEngine();
const testRunner = new F.TestRunner();
const utility = F.Utility;
const storage = new F.Storage("R10_");
// ===============
// app
// ===============
class App {
	constructor() {
		// ============================
		// so can get access in console
		// (e.g. app.utility_)
		// ============================
		this.renderEngine_ = renderEngine;
		this.testRunner_ = testRunner;
		this.utility_ = utility;
		this.storage_ = storage;
		this.factory_ = F;
		this.initializeRiver();
	}

	initializeRiver() {
		// ===================
		// River
		// ===================
		this.river_ = new F.River();
		window.river_ = this.river_;
		// ===================
		// Buttons
		// ===================
		this.river_.btn_save.onValue(() => this.save());
		this.river_.btn_rename.label("Rename").onValue(() => this.rename());
		this.river_.btn_delete.onValue(() => this.remove());
		this.river_.btn_todo.onValue(() => this.selectKey("Todo"));
		this.river_.btn_backup.onValue(() => {
			storage.getAllItems(null, this.river_.error).then((asTexts) => {
				utility.backup("orangeNotes", asTexts);
			});
		});
		this.river_.btn_print.onValue(() => utility.print(this.river_.txt_text.value()));
		this.river_.btn_today2.onValue(() => this.today());
		this.river_.btn_test1.label("TEST 1").onValue(() => this.test1());
		// this.river_.btn_test2.label("TEST 2").onValue(() => this.test2());
		// this.river_.btn_test3.label("TEST 3").onValue(() => this.test3());
		this.river_.btn_runTests.onValue(() => testRunner.runTests(this.river_.txt_log));
		// ===================
		// Toggle Buttons
		// ===================
		this.river_.btn_setColor.onValue(v => {
			if (v) {
				$("#btn_setColor").css("backgroundColor", "red");
			} else {
				$("#btn_setColor").css("backgroundColor", "green");
			}
		});
		// ===================
		// Search
		// ===================
		this.river_.form_search;
		this.river_.btn_search.onValue(() => this.search($("#form_search").val().split(" ")));
		// ===================
		// Text
		// ===================
		this.river_.txt_text.on("eventSave", () => this.save());
		this.river_.txt_text.onValue((v) => this.setLinkButtons(v));
		this.river_.txt_text.onDirty(bIsDirty => {
			if (bIsDirty) {
				$(".getsDirty").addClass("isDirty");
			} else {
				$(".getsDirty").removeClass("isDirty");
			}
		});
		// ===================
		// Log
		// ===================
		this.river_.txt_log.touch();
		// ===================
		// Paths
		// ===================
		this.river_.paths.onValue(v => {
			v.sort();
			const oldSelectedPath = this.river_.selectedPath.value();
			if (!v.includes(oldSelectedPath)) {
				let done = false;
				let newSelectedPath = v[0];
				v.forEach((each, index) => {
					if (!done && each > oldSelectedPath) {
						newSelectedPath = index === 0 ? v[0] : v[index - 1];
						done = true;
					}
				});
				this.river_.selectedPath.uPush(newSelectedPath);
			}
		});
		this.river_.selectedPath.onValue(v => this.read(v));
		// ===================
		// Finder
		// ===================
		this.river_.fnd_paths.touch();
		this.river_.paths.onValue(v => {
			const paths = v.map(each => each.split("/"));
			this.river_.fnd_paths.push(paths);
		});
		this.river_.selection_fnd_paths.onValue(v => this.river_.txt_log.push(v));
		this.river_.selection_fnd_paths.onValue(v => this.river_.selectedPath.uPush(v.join("/")));
		this.river_.selectedPath.onValue(v => this.river_.selection_fnd_paths.uPush(v.split("/")));
		// ===================
		// Errors
		// ===================
		this.river_.error.onValue((v) => {
			this.river_.txt_log.push(v.toString());
		});
		// ===================
		// Note Stack
		// ===================
		this.river_.btn_today.parentQuery_ = "#note_buttons";
		this.river_.btn_today.onValue(v => this.search(["@@|class|MemCard", new Date().toDateString()]));
		this.river_.btn_flip.parentQuery_ = "#note_buttons";
		this.river_.btn_flip.onValue();
		// ===================
		// Link Buttons
		// ===================
		this.river_.linkButtons.onValue((v) => this.renderLinkButtons(v));
		this.river_.bookmarkButtons.onValue((v) => this.renderBookmarkButtons(v));
	}

	log(s) {
		this.river_.txt_log.appendString(s);
	}

	selectKey(sKey) {
		return this.river_.selectedPath.uPush(sKey);
	}

	keyFromText(sText) {
		return sText.split("\n")[0];
	}

	save() {
		const text = this.river_.txt_text.value();
		const key = this.keyFromText(text);
		storage.setItem(key, text, this.river_.paths, this.river_.error);
		this.river_.txt_text.setClean();
		this.river_.selectedPath.uPush(key);
	}

	remove() {
		const text = this.river_.txt_text.value();
		const key = this.keyFromText(text);
		storage.removeItem(key, this.river_.paths, this.river_.error);
	}

	rename() {
		// remove old item without updating paths
		const oldKey = this.river_.selectedPath.value();
		storage.removeItem(oldKey, null, this.river_.error)
			.then(() => {
				this.save();
			});
	}

	read(sKey) {
		storage.getItem(sKey, this.river_.txt_text, this.river_.error);
	}

	updateKeys() {
		return storage.getKeys(this.river_.paths, this.river_.error);
	}

	forEachKeyAndText(f) {
		// f(sKey, sText){}
		return storage.getAllItems()
			.then((asTexts) => {
				asTexts.forEach((sText) => {
					const key = this.keyFromText(sText);
					f(key, sText);
				});
				return asTexts;
			});
	}

	forEachKeyAndTextAndData(f) {
		// f(sKey, sText){}
		return storage.getAllItems()
			.then((asTexts) => {
				asTexts.forEach((sText) => {
					const key = this.keyFromText(sText);
					const dataPaths = utility.getDataPaths(sText);
					f(key, sText, dataPaths);
				});
				return asTexts;
			});
	}

	dataToObject(aasData) {
		const result = {};
		aasData.forEach((each) => {
			result[each[0]] = each.slice(1);
		});
		return result;
	}

	test1() {
		const result = moment(new Date()).format("YYYY/MM");
		this.log(result);
	}

	search(asTerms) {
		const result = [];
		this.forEachKeyAndText((sKey, sText) => {
			if (asTerms.every((each) => sText.toLowerCase().includes(each.toLowerCase()))) {
				result.push(sKey);
			}
		}).then(() => {
			this.river_.paths.push(result);
		});
		// const terms = $("#form_search").val().toLowerCase().split(" ");
		// const texts = storage.getAllItems();
		// const keys = storage.getKeys();
		// console.log(keys);
		// if (terms.length < 2 && terms[0] == "") {
		// 	alert("No Search paramters entered!");
		// 	return;
		// }
		// const results = this.searchLogic(terms, texts, keys);
		// if (results.length < 1) {
		// 	alert("No notes matched the search paramters.");
		// 	return;
		// }
		// this.river_.paths.push(results);
	};

	searchLogic(terms, texts, keys) {
		const results = [];
		texts.forEach(function (text) {
			const test = [];
			terms.forEach(function (term) {
				if (text.toLowerCase().includes(term)) {
					test.push(term);
				}
			});
			if (test.length === terms.length) {
				const index = texts.indexOf(text);
				results.push(keys[index]);
			}
		});
		return results;
	}

	// ===================================
	// Page Buttons
	// ===================================
	renderLinkButtons(aasDataPaths) {
		//
		// @@|link|Google|https://google.com
		// @@|link|Google|https://google.com|orange
		// [label|link|[color]]
		//
		const tempRiver = new F.River();
		aasDataPaths.forEach((each, index) => {
			const id = "btn_link_" + index;
			const label = each[0];
			const link = each[1];
			const color = each[2];
			//
			const buttonStream = tempRiver[id];
			buttonStream.label(label);
			buttonStream.parentQuery_ = "#linkButtons";
			buttonStream.postRender_ = ($element) => {
				$element.on("click", () => window.open(link, "_blank"));
				if (color) {
					$element.css("backgroundColor", color);
				}
			};
		});
		renderEngine.clear("#linkButtons");
		renderEngine.render(tempRiver);
	}

	bookmarkLabel(asDataPath) {
		const path = asDataPath[0];
		const lastColumn = path.split("/").slice(-1)[0];
		const label = asDataPath[2];
		return label || lastColumn;
	}

	bookmarkSort(aasDataPaths) {
		// destructive sort
		aasDataPaths.sort((a, b) => this.bookmarkLabel(a).localeCompare(this.bookmarkLabel(b)));
		return aasDataPaths;
	}

	renderBookmarkButtons(aasDataPaths) {
		//
		// @@|bookmark
		// @@|bookmark|red
		// @@|bookmark|red|All References
		// [[path, [color], [label]], [path, [color], [label]]]
		//
		const tempRiver = new F.River();
		this.bookmarkSort(aasDataPaths).forEach((each, index) => {
			const id = "btn_bookmark_" + index;
			const path = each[0];
			const color = each[1];
			const lastColumn = path.split("/").slice(-1);
			const label = each[2] || lastColumn;
			//
			const buttonStream = tempRiver[id];
			buttonStream.label(label);
			buttonStream.parentQuery_ = "#bookmarkButtons";
			buttonStream.postRender_ = ($element) => {
				$element.on("click", () => this.selectKey(path));
				if (color) {
					$element.css("backgroundColor", color);
				}
			};
		});
		renderEngine.clear("#bookmarkButtons");
		renderEngine.render(tempRiver);
	}

	setLinkButtons(sText) {
		const linkDataPaths = utility.getDataPaths(sText)
			.filter((each) => each[0] === "link")
			.map((each) => each.slice(1));
		this.river_.linkButtons.uPush(linkDataPaths);
	}

	setBookmarkButtons() {
		const bookmarkDataPaths = [];
		this.forEachKeyAndText((sKey, sText) => {
			const pagePaths = utility.getDataPaths(sText)
				.filter((each) => each[0] === "bookmark")
				.map((each) => utility.prepended(each.slice(1), sKey));
			bookmarkDataPaths.push(...pagePaths);
		}).then(() => {
			this.river_.bookmarkButtons.uPush(bookmarkDataPaths);
		});
	}

	today() {
		const path = moment(new Date()).format("YYYY/MM MMM/DD");
		const dayString = new Date().toLocaleDateString("en-US", {weekday: "long"});
		const text = path + "\n\n" + dayString;
		this.goOrMake(path, text);
	}

	goOrMake(sKey, sText = "") {
		if (this.pathExists(sKey)) {
			this.selectKey(sKey);
		} else {
			this.createPage(sKey, sText);
		}
	}

	pathExists(sPath) {
		return this.river_.paths.value().includes(sPath);
	}

	createPage(sKey, sText) {
		this.river_.txt_text.cuPush(sText);
		this.save();
	}

	// ===================================
	// main
	// ===================================
	main() {
		console.log("==== main() start ====");
		storage.login().then(() => {
			console.log("==== logged in ====");
			renderEngine.render(this.river_);
			$("#btn_save").addClass("getsDirty");
			$("#btn_rename").addClass("getsDirty");
			$("#btn_delete").addClass("getsDirty");
			this.updateKeys().then(() => {
				//this.selectKey("Todo");
				this.today();
			});
			this.setBookmarkButtons();
			console.log("==== main() end ====");
		});
	}
}

const app = new App();
window.app = app;
// "hidden" means tab is not selected in Chrome, NOT whether the page is visible
$(document).ready(() => {
	if (document.hidden) {
		console.log("==== document is hidden ====");
		let f;
		f = () => {
			console.log("==== event visibilitychange (once) ====");
			app.main();
			document.removeEventListener("visibilitychange", f);
		};
		document.addEventListener("visibilitychange", f);
	} else {
		console.log("==== document is not hidden ====");
		app.main();
	}
});
console.log("end index.js");

