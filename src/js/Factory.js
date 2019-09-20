import {River} from "./River";
import {TestEngine} from "./TestEngine";
import {TestRunner} from "./TestRunner";
import {RenderEngine} from "./RenderEngine";
import {Storage} from "./Storage";

const Factory = {
	River: River,
	TestEngine: TestEngine,
	TestRunner: TestRunner,
	RenderEngine: RenderEngine,
	Storage: Storage,
	classes: function () {
		return Object.values(this);
	},
};
//
export default Factory;