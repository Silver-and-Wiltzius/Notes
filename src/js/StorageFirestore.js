import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

class StorageFirestore {
	constructor() {
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
			firebase.auth().signInWithPopup(provider).then(function (result) {
				// This gives you a Google Access Token. You can use it to access the Google API.
				const token = result.credential.accessToken;
				// The signed-in user info.
				const user = result.user;
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
			this.db = firebase.firestore();
		}
	}

	removeItem(sKey, zKeys) {
		9999;
		if (zKeys) {
			zKeys.cuPush(this.getKeys());
		}
		return this;
	}

	// =========================
	// Utility
	// =========================
	toDocId(sKey) {
		return sKey.replace(/\//g, '_');
	}

	fromDocId(sId) {
		return sId.replace(/_/g, "/");
	}

	// =========================
	// Storage API
	// =========================
	getItem(sKey, zResult, zError) {
		this.db.collection("Notes")
			.doc(this.toDocId(sKey))
			.get()
			.then((doc) => {
				if (doc.exists) {
					zResult.cuPush(doc.data().text);
				} else {
					zError.push("No such document: " + sKey);
				}
			})
			.catch((error) => {
				zError.push(error);
			});
	}

	setItem(sKey, sText, zKeys, zError) {
		this.db.collection("Notes")
			.doc(this.toDocId(sKey))
			.set({text: sText})
			.then(() => this.getKeys(zKeys))
			.catch((error) => zError.push(error));
	}

	getKeys(zResult, zError) {
		this.db.collection("Notes").get()
			.then((snapshotNotes) => {
				const result = [];
				snapshotNotes.forEach((eachDoc) => {
					result.push(this.fromDocId(eachDoc.id));
				});
				zResult.cuPush(result);
			})
			.catch((error) => {
				zError.push(error);
			});
	}

	getAllItems(zResult, zError) {
		this.db.collection("Notes").get()
			.then((snapshotNotes) => {
				const result = [];
				snapshotNotes.forEach((eachDoc) => {
					if (eachDoc.exists) {
						result.push(eachDoc.data().text);
					}
				});
				zResult.cuPush(result);
			})
			.catch((error) => {
				zError.push(error);
			});
	}

	static test_first() {
	}
}

export {StorageFirestore};