import F from "./Factory";
import $ from "jquery";
import moment from "moment";
import * as firebase from "firebase";

if (navigator.onLine) {
	// Initialize Cloud Firestore through Firebase
	const firebaseConfig = {
		apiKey: "AIzaSyCp4qUEkR4skyeoXMv8JmX17q3pq09_OJM",
		authDomain: "notes-6b42b.firebaseapp.com",
		databaseURL: "https://notes-6b42b.firebaseio.com",
		projectId: "notes-6b42b",
		storageBucket: "notes-6b42b.appspot.com",
		messagingSenderId: "594485884291",
		appId: "1:594485884291:web:150a5ec084c0f3705cf2b6",
	};
	firebase.initializeApp(firebaseConfig);
	// Authorize Cloud Firestore
	const provider = new firebase.auth.GoogleAuthProvider();
	console.log(3333, provider);
	firebase.auth().signInWithPopup(provider).then(function (result) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		const token = result.credential.accessToken;
		console.log(4444, token);
		// The signed-in user info.
		const user = result.user;
		console.log(5555, user);
		// ...
	}).catch(function (error) {
		// Handle Errors here.
		const errorCode = error.code;
		const errorMessage = error.message;
		// The email of the user's account used.
		const email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		const credential = error.credential;
		// ...
	});
	// firebase.auth().signInWithEmailAndPassword("stanley.silver@yahoo.com", "123456")
	// 	.then(() => {
	// 		console.log("Firestore: Sign in success");
	// 	})
	// 	.catch((error) => {
	// 		console.log("Firestore: Sign in error", error.code, error.message);
	// 	});
	//Enable persistence
	firebase.firestore().enablePersistence()
		.then(() => {
			console.log("Firestore: enablePersistence() success");
		})
		.catch(function (error) {
			if (error.code === "failed-precondition") {
				console.log("Firestore Error: Multiple tabs open, persistence can only be enabled in one tab at a a time.");
			} else if (error.code === "unimplemented") {
				console.log("The current browser does not support all of the features required to enable persistence");
			}
		});
	// Set db
	window.db = firebase.firestore();
}
console.log(7777, "db", db);
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
		this.river_.btn_keys.label("???").onValue(() => console.log(1111, storage.getKeys()));
		this.river_.btn_runTests.onValue(() => testRunner.runTests(this.river_.txt_log));
		// ===================
		// Search
		// ===================
		this.river_.form_search;
		this.river_.btn_search.onValue(() => this.search());
		// ===================
		// List
		// ===================
		this.river_.ul_keys.onValue(v => {
			this.river_.selection_ul_keys.push(v[0]);
		});
		this.river_.selection_ul_keys.onValue(v => this.read(v));
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
		this.river_.ul_keys.onValue(v => {
			const paths = v.map(each => each.split("/"));
			this.river_.fnd_paths.push(paths);
		});
		this.river_.selection_fnd_paths.onValue(v => this.river_.txt_log.push(v));
		this.river_.selection_fnd_paths.onValue(v => this.river_.selection_ul_keys.uPush(v.join("/")));
		this.river_.selection_ul_keys.onValue(v => this.river_.selection_fnd_paths.uPush(v.split("/")));
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
		const terms = $("#form_search").val().toLowerCase().split(" ");
		const texts = storage.getAllItems();
		const keys = storage.getKeys();
		console.log(keys);
		if (terms.length < 2 && terms[0] == "") {
			alert("No Search paramters entered!");
			return;
		}
		;
		const results = this.searchLogic(terms, texts, keys);
		if (results.length < 1) {
			alert("No notes matched the search paramters.");
			return;
		}
		// $('#ul_keys').empty();
		// results.forEach(function(result){
		// 	$('#ul_keys').append('<li>' + result + '</li>')
		// });
		this.river_.ul_keys.push(results);
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
			if (test.length == terms.length) {
				const index = texts.indexOf(text);
				results.push(keys[index]);
			}
			;
		});
		return results;
	}

	main() {
		console.log("9999", "==== main() ====");
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

