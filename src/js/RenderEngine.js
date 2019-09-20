import TextPane from "./TextPane";
import $ from "jquery";

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
			const id = each;
			const label = river[each].label() || this.labelFromIndex(each);
			$("#buttons").append(`<button id="${id}" class="Button">${label}</button>`);
			$(`#${id}`).click(event => river[each].push(event));
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
	}
}

export {RenderEngine};