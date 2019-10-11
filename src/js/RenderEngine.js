import TextPane from "./TextPane";
import {Finder} from "./Finder";
import $ from "jquery";

window.jQuery = $;

class RenderEngine {
	labelFromIndex(sIndex) {
		const noPrefix = sIndex.split("_")[1];
		const withSpaces = [];
		noPrefix.split("").forEach((each, index) => {
			if (index === 0) {
				withSpaces.push(each.toUpperCase());
			} else {
				if (each === each.toUpperCase()) {
					withSpaces.push(" ");
				}
				withSpaces.push(each);
			}
		});
		return withSpaces.join("");
	}

	render(river) {
		const streamKeys = Object.keys(river.self_);
		streamKeys.filter(each => each.startsWith("btn_")).forEach(each => {
			//this.renderButton(each, river);
			this.renderButton(river[each]);
		});
		// streamKeys.filter(each => each.startsWith("btn2_")).forEach(each => {
		// 	this.renderButton2(river[each]);
		// });
		streamKeys.filter(each => each.startsWith("tbn_")).forEach(each => {
			this.renderButton(river[each]);
		});
		streamKeys.filter(each => each.startsWith("form_")).forEach(each => {
			const id = each;
			const label = river[each].label() || this.labelFromIndex(each);
			$("#buttons").append(`<input type="search" id="${id}" class="Form" placeholder="${label}">`);
		});
		streamKeys.filter(each => each.startsWith("ul_")).forEach(each => {
			const id = each;
			//create the list once
			$("#panes").append(`<div class="ListPane"><ul id="${id}"></ul></div>`);
			//create the click handler once, on the document
			$(document).on("click", `#${id} li`, function () {
				river[`selection_${each}`].uPush($(this).text());
			});
			//each time the stream changes (and at creation), update the ul
			river[each].onValue(v => {
				$(`#${id}`).empty();
				v.forEach(each2 => {
					$(`#${id}`).append(`<li>${each2}</li>`);
				});
			}, true);
			river[`selection_${each}`].onValue(v => {
				$(`#${id} li`).removeClass("selected");
				$(`#${id} li`).filter(function () {
					return $(this).text() === v;
				}).addClass("selected");
			});
		});
		streamKeys.filter(each => each.startsWith("txt_")).forEach(each => {
			const id = each;
			//create the textarea once
			$("#panes").append(`<textarea id="${id}" class="TextPane"></textarea>`);
			//create the change handler once, for the textarea
			$(`#${id}`).on("change keyup paste", function () {
				river[each].uPush($(this).val());
			});
			//create the textPane, with keydown handler, once, for the textarea
			const textPane = new TextPane();
			river[each].textPane_ = textPane;
			textPane.onSave = () => river[each].emit("eventSave");
			$(`#${id}`).on("keydown", textPane.onKeyDown.bind(textPane));
			//each time the stream changes, update the textarea
			river[each].onValue(v => {
				$(`#${id}`).val(v);
			}, true);
		});
		streamKeys.filter(each => each.startsWith("fnd_")).forEach(each => {
			const id = each;
			const selectionKey = "selection_" + each;
			const finder = new Finder(id, $("#panes"), river[each], river[selectionKey]);
			finder.render();
		});
	}

	renderButton(zButton) {
		// btn_
		// all buttons are toggle buttons, starting off false
		const streamName = zButton.name_;
		const parentQuery = zButton.parentQuery_ || "#buttons";
		const label = zButton.label() || this.labelFromIndex(streamName);
		$(parentQuery).append(`<button id="${streamName}" class="Button">${label}</button>`);
		const $element = $(`#${streamName}`);
		$element.click(() => {
			if (zButton.value()) {
				zButton.push(false);
			} else {
				zButton.push(true);
			}
		});
		if (zButton.postRender_) {
			zButton.postRender_($element);
		}
	}

	clear(sQuery) {
		$(sQuery).empty();
	}
}

export {RenderEngine};