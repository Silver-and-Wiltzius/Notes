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
window.storage = new F.Storage("R10_");
window.FF = F;
// ===============
// app
// ===============
class App {
	constructor() {
		this.initializeRiver();
	}

	initializeRiver() {
		// ===================
		// River
		// ===================
		this.river_ = new F.River();
		this.pageRiver_ = new F.River();
		window.river_ = this.river_;
		// ===================
		// Buttons
		// ===================
		this.river_.btn_save.onValue(() => this.save());
		this.river_.btn_rename.label("Rename").onValue(() => console.log("Rename"));
		this.river_.btn_todo.onValue(() => this.read("Todo"));
		this.river_.btn_backup.onValue(() => {
			storage.getAllItems(null, this.river_.error).then((asTexts) => {
				utility.backup("orangeNotes", asTexts);
			});
		});
		this.river_.btn_print.onValue(() => utility.print(this.river_.txt_text.value()));
		this.river_.btn_delete.onValue(() => this.remove());
		// this.river_.btn_test1.label("TEST 1").onValue(() => this.test1());
		// this.river_.btn_test2.label("TEST 2").onValue(() => this.test2());
		// this.river_.btn_test3.label("TEST 3").onValue(() => this.test3());
		this.river_.btn_runTests.onValue(() => testRunner.runTests(this.river_.txt_log));
		// ===================
		// Toggle Buttons
		// ===================
		this.river_.tbn_setColor.parentQuery_ = "#t_buttons";
		this.river_.tbn_setColor.toggled_ = false;
		this.river_.tbn_setColor.onValue(v => {
			const toggleState = this.river_.tbn_setColor.toggled_;
			if (toggleState) {
				$("#tbn_setColor").css("backgroundColor", "red");
				this.river_.tbn_setColor.toggled_ = false;
			} else {
				$("#tbn_setColor").css("backgroundColor", "green");
				this.river_.tbn_setColor.toggled_ = true;
			}
		});
		// ===================
		// Search
		// ===================
		this.river_.form_search;
		this.river_.btn_search.onValue(() => this.search());

		// ===================
		// Text
		// ===================
		this.river_.txt_text.on("eventSave", () => this.save());
		this.river_.txt_text.onValue((v) => this.setPageButtons(v));
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
			const oldSelectedPath = this.river_.selectedPath.value();
			if (!v.includes(oldSelectedPath)) {
				const sorted = _.sortBy(v);
				sorted.forEach((each, index) => {
					if (each > oldSelectedPath) {
						const newSelectedPath = index === 0 ? v[1] : v[index-1];
						this.river_.selectedPath.uPush(newSelectedPath);
						return null;
					}
				})
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
		this.river_.btn_one.parentQuery_ = "#note_buttons";
		this.river_.btn_one.onValue(v => console.log(v));
	}

	save() {
		const text = this.river_.txt_text.value();
		const key = text.split("\n")[0];
		storage.setItem(key, text, this.river_.paths, this.river_.error);
		this.river_.txt_text.setClean();
		this.river_.selectedPath.uPush(key);
	}

	read(sKey) {
		storage.getItem(sKey, this.river_.txt_text, this.river_.error);
	}

	remove() {
		const text = this.river_.txt_text.value();
		const key = text.split("\n")[0];
		storage.removeItem(key, this.river_.paths, this.river_.error);
	}

	updateKeys() {
		storage.getKeys(this.river_.paths, this.river_.error);
	}

	search() {
		const terms = $("#form_search").val().toLowerCase().split(" ");
		const texts = storage.getAllItems();
		const keys = storage.getKeys();
		console.log(keys);
		if (terms.length < 2 && terms[0] == "") {
			alert("No Search paramters entered!");
			return;
		}
		const results = this.searchLogic(terms, texts, keys);
		if (results.length < 1) {
			alert("No notes matched the search paramters.");
			return;
		}
		this.river_.paths.push(results);
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

	setPageButtons(sText) {
		F.River.clear(this.pageRiver_);
		this.pageRiver_.btn2_google.parentQuery_ = "#pageButtons";
		this.pageRiver_.btn2_google.onValue(() => {
			alert("Google");
		});
		renderEngine.clear("#pageButtons");
		renderEngine.render(this.pageRiver_);
	}

	main() {
		console.log("==== main() ====");
		renderEngine.render(this.river_);
		this.updateKeys();
		$("#btn_Save").addClass("getsDirty");
		$("#btn_save").addClass("getsDirty");
		this.read("Todo");
	}
}

const app = new App();
$(document).ready(() => {
	app.main();
});
console.log("end index.js");

