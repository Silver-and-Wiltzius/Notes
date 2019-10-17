//
// ===============
// text pane
// ===============
import $ from "jquery";

class TextPane {
	// ============================
	// String
	// ============================
	lineStart(sText, iLineNumber) {
		const lines = sText.split("\n");
		const beforeLines = lines.slice(0, iLineNumber - 1);
		const beforeText = beforeLines.join("\n");
		return beforeText.length + 1;
	}

	lineIndex(sText, iPosition) {
		let count = 0;
		for (let i = 0; i < iPosition; i++) {
			if (sText.charAt(i) === "\n") {
				count++;
			}
		}
		return count;
	}

	makeLine(sCharacter, iLength) {
		return sCharacter.repeat(iLength);
	}

	// ============================
	// textarea
	// ============================
	gotoLine(txa, iLineNumber) {
		const lineStart = this.lineStart(txa.value, iLineNumber);
		txa.setSelectionRange(lineStart, lineStart);
	}

	insertText(txa, sText, iOffset = 0) {
		const currentStart = txa.selectionStart;
		const currentEnd = txa.selectionEnd;
		const newStart = currentStart + sText.length + iOffset;
		txa.value = txa.value.substring(0, currentStart) + sText + txa.value.substring(currentEnd);
		txa.setSelectionRange(newStart, newStart);
		//bubble input event for "dirty" listener
		txa.dispatchEvent(new Event("input", {bubbles: true}));
	}

	insertHeader(txa, iLength) {
		const text = txa.value;
		const selection = txa.selectionStart;
		const lineIndex = this.lineIndex(text, selection);
		const lines = text.split("\n");
		//
		const beforeLines = lines.slice(0, lineIndex);
		const before = beforeLines.join("\n");
		const afterLines = lines.slice(lineIndex + 1);
		const after = afterLines.join("\n");
		const currentLine = lines[lineIndex];
		const dividerLength = Math.max(currentLine.length, iLength || 0);
		const divider = this.makeLine("=", dividerLength);
		const headerLines = [divider, lines[lineIndex], divider];
		const header = headerLines.join("\n");
		//
		const newText = [before, header, after].join("\n");
		const newSelection = before.length + header.length + 2;
		//
		txa.value = newText;
		txa.setSelectionRange(newSelection, newSelection);
		//bubble input event for "dirty" listener
		txa.dispatchEvent(new Event("input", {bubbles: true}));
	}

	// ============================
	// events
	// ============================
	eventStop(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	onTab(event) {
		if (event.keyCode === 9) {
			//tab
			this.eventStop(event);
			const txa = event.target;
			this.insertText(txa, "\t");
			return true;
		}
		return false;
	}

	onCacKeydown(txa, letter, event) {
		if (letter === "L") {
			this.insertText(txa, this.makeLine("=", 36));
			this.eventStop(event);
		} else if (letter === "D") {
			this.insertText(txa, format(new Date(), "YYYYMMDD "));
			this.eventStop(event);
		} else if (letter === "H") {
			this.insertHeader(txa, 20);
			this.eventStop(event);
		} else if (letter === "2") {
			this.gotoLine(txa, 2);
			this.insertText(txa, "@@/Button/9999/green\n", -1);
			this.eventStop(event);
		} else if (letter === "3") {
			this.insertText(txa, "@@|Link|9999|");
			this.eventStop(event);
		} else {
			console.log("=== handleCacKeydown ===", "cac-keydown", letter);
		}
	}

	onSave(sText) {
		// override this in the instance
		console.log("onSave", sText.slice(0, 100));
	}

	onKeyDown(event) {
		if (this.onTab(event)) {
			// return if tab key was pressed
			return this;
		} else if (navigator.platform.match("Win") || navigator.platform.match("Linux")) {
			if(event.keyCode == 83 && event.ctrlKey == true) {
				const text = event.target.value;
				this.eventStop(event);
				this.onSave(text);
				return this;
			}
		} else if ([17, 18, 91].includes(event.keyCode)) {
			// return if modifier key is being pressed

			return this;
		} else if (event.metaKey) {
			//command
			const letter = String.fromCharCode(event.keyCode);
			const txa = event.target;
			if (letter === "S") {
				//command-S
				this.eventStop(event);
				const text = txa.value;
				this.onSave(text);
				return this;
			} else if (event.ctrlKey && event.altKey) {
				//control-alt-command
				this.onCacKeydown(txa, letter, event);
				return this;
			}
		} else {
			return this;
		}
	}
}

class TextPane2 extends TextPane {
	constructor(zTextStream) {
		super();
		this.stream_ = zTextStream;
	}

	render() {
		const id = this.stream_.name_;
		//create the textarea once
		$("#panes").append(`<textarea id="${id}" class="TextPane"></textarea>`);
		const $element = $(`#${id}`);
		// textarea key events
		$element.on("keydown", this.onKeyDown.bind(this));
		// textarea to stream
		$element.on("change keyup paste", (event) => {
			this.stream_.uPush($(event.target).val());
		});
		this.onSave = () => this.stream_.emit("eventSave");
		// stream to text area
		this.stream_.onValue(v => {
			$element.val(v);
		}, true);
	}
}

export {TextPane, TextPane2};