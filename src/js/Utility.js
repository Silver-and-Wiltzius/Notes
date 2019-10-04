import moment from "moment";

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

	static test_first(t) {
		t.eq(1, 1);
	}
}

export {Utility};