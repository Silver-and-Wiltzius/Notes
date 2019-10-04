import F from "./Factory";
import $ from "jquery";
import moment from "moment";
import { River } from "./River";
import yaml from "js-yaml";

console.log("start index.js");
//
// ===============
// singletons
// ===============
const renderEngine = new F.RenderEngine();
const testRunner = new F.TestRunner();
window.storage = new F.Storage("R10_");
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
		window.river_ = this.river_;
		// ===================
		// Buttons
		// ===================
		this.river_.btn_save.onValue(() => this.save());
		this.river_.btn_rename.label("Rename").onValue(() => console.log("Rename"));
		this.river_.btn_todo.onValue(() => this.read("Todo"));
		this.river_.btn_backup.onValue(() => this.backup());
		this.river_.btn_print.onValue(() => this.print());
		this.river_.btn_delete.onValue(() => this.remove());
		// this.river_.btn_test1.label("TEST 1").onValue(() => this.test1());
		// this.river_.btn_test2.label("TEST 2").onValue(() => this.test2());
		// this.river_.btn_test3.label("TEST 3").onValue(() => this.test3());
		this.river_.btn_runTests.onValue(() => testRunner.runTests(this.river_.txt_log));
		// ===================
		// Toggle Buttons
		// ===================
		this.river_.tbn_setColor.parentQuery_ = "#t_buttons"
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
		// List
		// ===================
		this.river_.paths.onValue(v => {
			if (!v.includes(this.river_.selectedPath)) {
				this.river_.selectedPath.push(v[0]);
			}
		});
		this.river_.selectedPath.onValue(v => this.read(v));
		// ===================
		// Text
		// ===================
		this.river_.txt_text.on("eventSave", () => this.save());
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
	}

	save() {
		const text = this.river_.txt_text.value();
		const key = text.split("\n")[0];
		storage.setItem(key, text, this.river_.paths);
		this.river_.txt_text.setClean();
	}

	read(sKey) {
		storage.getItem(sKey, this.river_.txt_text);
	}

	remove() {
		const nextKey = this.river_.paths.value()[0];
		const text = this.river_.txt_text.value();
		const key = text.split("\n")[0];
		storage.removeItem(key, this.river_.paths);
		this.read(nextKey);
	}

	updateKeys() {
		storage.getKeys(this.river_.paths);
	}

	saveFile(filename, data) {
		const blob = new Blob([data], {type: "text/text"});
		const element = window.document.createElement("a");
		const url = window.URL.createObjectURL(blob);
		element.href = url;
		element.download = filename;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		window.URL.revokeObjectURL(url);
	}

	backup() {
		const delimiter = "\n===||===||===\n";
		const texts = storage.getAllItems();
		const date = moment().format("YYYYMMDD[]HHmm");
		const filename = "knowts" + date + ".txt";
		const text = filename + delimiter + texts.join(delimiter);
		this.saveFile(filename, text);
	};

	print() {
		//don't know how to get rid of first indent in print window
		const text = this.river_.txt_text.value();
		if (!text) {
			alert("No selected knowt");
			return this;
		}
		const html = `
			<style>
				.plainText {
					white-space: pre-wrap;
				}
			</style>
			<div class="plainText">
			${text}
			</div>`;
		const newWindow = window.open("", "PrintWindow", "width=500,height=500,top=200,left=200,menubar=no,toolbars=no,scrollbars=no,status=no,resizable=no");
		newWindow.document.writeln(html);
		newWindow.document.close();
		newWindow.focus();
		newWindow.print();
		newWindow.close();
	};

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

