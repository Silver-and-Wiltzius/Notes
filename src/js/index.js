import F from "./Factory";
import $ from "jquery";
import moment from "moment";

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
		this.river_ = new F.River();
		//
		this.river_.btn_save.onValue(() => this.save());
		this.river_.btn_rename.label("Rename").onValue(() => console.log("Rename"));
		this.river_.btn_todo.onValue(() => this.read("Todo"));
		this.river_.btn_backup.onValue(() => this.backup());
		this.river_.btn_delete.onValue(() => this.remove());
		this.river_.btn_keys.label("???").onValue(() => console.log(1111, storage.getKeys()));
		this.river_.btn_runTests.onValue(() => testRunner.runTests(this.river_.txt_log));
		//
		this.river_.ul_keys.touch();
		this.river_.selection_ul_keys.onValue(v => this.read(v));
		//
		this.river_.txt_text.on("eventSave", () => this.save());
		this.river_.txt_text.onDirty(bIsDirty => {
			if (bIsDirty) {
				$(".getsDirty").addClass("isDirty");
			} else {
				$(".getsDirty").removeClass("isDirty");
			}
		});
		//
		this.river_.txt_log.touch();
	}

	save() {
		const text = this.river_.txt_text.value();
		const key = text.split("\n")[0];
		storage.setItem(key, text, this.river_.ul_keys);
		this.river_.txt_text.setClean();
	}

	read(sKey) {
		storage.getItem(sKey, this.river_.txt_text);
	}

	remove() {
		const text = this.river_.txt_text.value();
		const key = text.split("\n")[0];
		storage.removeItem(key, this.river_.ul_keys);
		this.read(storage.getKeys()[0]);
	}

	updateKeys() {
		this.river_.ul_keys.uPush(storage.getKeys());
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
		console.log(111,texts);
		const date = moment().format("YYYYMMDD[]HHmm");
		const filename = "knowts" + date + ".txt";
		const text = filename + delimiter + texts.join(delimiter);
		this.saveFile(filename, text);
	};

	main() {
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

