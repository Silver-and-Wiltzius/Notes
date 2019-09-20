import {River} from "./River";
import {TestEngine} from "./TestEngine";
import {TestRunner} from "./TestRunner";
import {RenderEngine} from "./RenderEngine";
import {Storage} from "./Storage";
import {Sandbox} from "./Sandbox";

const Factory = {
	River: River,
	TestEngine: TestEngine,
	TestRunner: TestRunner,
	RenderEngine: RenderEngine,
	Storage: Storage,
	Sandbox: Sandbox,
	classes: function () {
		return Object.values(this);
	},
};
//
export default Factory;