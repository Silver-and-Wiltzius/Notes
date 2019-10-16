import moment from "moment";

const UtilityPure = {
	getDataPaths: function (sText) {
		if (!sText) {
			return [];
		}
		if (sText.trim().length === 0) {
			return [];
		}
		const lines = sText.split("\n");
		const dataLines = lines.filter(function (each) {
			return (each.slice(0, 2) === "@@");
		});
		const dataPaths = dataLines.map(function (each) {
			const delimiter = each[2];
			const path = each.split(delimiter);
			return (path.slice(1));
		});
		return dataPaths;
	},
	print: function (oKnowt) {
		//don't know how to get rid of first indent in print window
		if (!oKnowt) {
			alert("No selected knowt");
			return this;
		}
		const text = oKnowt.text().trim();
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
	},
	saveFile: function (filename, data) {
		const blob = new Blob([data], {type: "text/text"});
		const element = window.document.createElement("a");
		const url = window.URL.createObjectURL(blob);
		element.href = url;
		element.download = filename;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		window.URL.revokeObjectURL(url);
	},
	delimitedText: function (sText, sDelimiter = "=====||=====") {
		let delimitedText;
		if (sText.includes(sDelimiter)) {
			delimitedText = sText.slice(sText.indexOf(sDelimiter) + sDelimiter.length + 1).trim();
		} else {
			delimitedText = "";
		}
		return delimitedText;
	},
	yaml: function (sText, sDelimter = "=====||=====") {
		const yamlText = this.delimitedText(sText, sDelimter);
		const result = yaml.safeLoad(yamlText);
		return result;
	},
	evalText: function (sText) {
		const delimiter = "===//===";
		const text = sText;
		let body, code, result;
		if (text.includes(delimiter)) {
			body = text.slice(0, text.indexOf(delimiter)).trim();
		} else {
			body = text.trim();
		}
		if (!body) {
			body = "3 + 4";
		}
		try {
			code = `try{${body}} catch(error) {error}`;
			result = this.evalInContext(code, window);
		} catch (error) {
			// with parentheses
			code = `try{(${body})} catch(error) {error}`;
			result = this.evalInContext(code, window);
		}
		return body + "\n\n" + delimiter + "\n\n" + JSON.stringify(result);
	},
	evalInContext: function (js, context) {
		//# Return the results of the in-line anonymous function we .call with the passed context
		return function () {
			return eval(js);
		}.call(context);
	},
};

class Utility {
	static saveFile(filename, data) {
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

	static backup(sTitle, asTexts) {
		const delimiter = "\n===||===||===\n";
		const date = moment().format("YYYYMMDD[]HHmm");
		const filename = sTitle + date + ".txt";
		const text = filename + delimiter + asTexts.join(delimiter);
		this.saveFile(filename, text);
	};

	static print(sText) {
		//don't know how to get rid of first indent in print window
		if (!sText) {
			alert("No text to print");
			return this;
		}
		const html = `
			<style>
				.plainText {
					white-space: pre-wrap;
				}
			</style>
			<div class="plainText">
			${sText}
			</div>`;
		const newWindow = window.open("", "PrintWindow", "width=500,height=500,top=200,left=200,menubar=no,toolbars=no,scrollbars=no,status=no,resizable=no");
		newWindow.document.writeln(html);
		newWindow.document.close();
		newWindow.focus();
		newWindow.print();
		newWindow.close();
	};

	static getDataPaths(sText) {
		if (!sText) {
			return [];
		}
		if (sText.trim().length === 0) {
			return [];
		}
		const lines = sText.split("\n");
		const dataLines = lines.filter((each) => each.slice(0, 2) === "@@");
		const dataPaths = dataLines.map(function (each) {
			const delimiter = each[2];
			const path = each.split(delimiter);
			return (path.slice(1));
		});
		return dataPaths;
	}

	static prepended(a, v) {
		a.unshift(v);
		return a;
	}

	static test_first(t) {
		t.eq(1, 1);
	}

	static test_prepended(t) {
		t.eq(this.prepended([22, 33], 11), [11, 22, 33]);
	}

	static test_getDataPaths(t) {
		const text = `asdf
asdf
@@/11/22/33
asdf
@@/44/55/66/77
asdf
asdf`;
		let result = this.getDataPaths(text);
		t.eq(result, [["11", "22", "33"], ["44", "55", "66", "77"]]);
	}
}

window.utility = Utility;
export {Utility};