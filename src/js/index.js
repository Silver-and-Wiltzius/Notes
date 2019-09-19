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
		this.river_.btn_print.onValue(() => this.print());
		this.river_.btn_delete.onValue(() => this.remove());
		this.river_.btn_keys.label("???").onValue(() => console.log(1111, storage.getKeys()));
		this.river_.btn_runTests.onValue(() => testRunner.runTests(this.river_.txt_log));
		this.river_.form_search.onValue();
		this.river_.btn_search.onValue(() => this.search());
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
		const terms = $('#form_search').val().toLowerCase().split(" ");
		const texts = storage.getAllItems();
		let results = [];
		const keys = storage.getKeys()
		console.log(keys);

		if (terms.length < 2 && terms[0] == "") {
			alert('No Search paramters entered!');
			return;
		};

		texts.forEach(function(text) {
			let test = [];
			terms.forEach(function(term) {
				if (text.toLowerCase().includes(term)) {
					test.push(term)
				}
			});

			if (test.length == terms.length) {
				let key = texts.indexOf(text)
				results.push(keys[key]);
			};
		});
		if (results.length < 1) {
			alert("No notes matched the search paramters.");
			return;
		}
		console.log(results);
		$('#ul_keys').empty();
		results.forEach(function(result){
			$('#ul_keys').append('<li>' + result + '</li>')
		});
	};

	main() {
		renderEngine.render(this.river_);
		this.updateKeys();
		$("#btn_Save").addClass("getsDirty");
		$("#btn_save").addClass("getsDirty");
		this.read("Todo");
	};
};

const app = new App();
$(document).ready(() => {
	app.main();
});
console.log("end index.js");

