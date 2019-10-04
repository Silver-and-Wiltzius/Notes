import {River} from "./River";
import {TestEngine} from "./TestEngine";
import {TestRunner} from "./TestRunner";
import {RenderEngine} from "./RenderEngine";
import {Storage} from "./Storage";
import {StorageFirestore} from "./StorageFirestore";
import {Finder} from "./Finder";
import {Utility} from "./Utility";

const Factory = {
	River: River,
	TestEngine: TestEngine,
	TestRunner: TestRunner,
	RenderEngine: RenderEngine,
	Storage: StorageFirestore,
	StorageFirestore: StorageFirestore,
	Finder: Finder,
	Utility: Utility,
	classes: function () {
		return Object.values(this);
	},
};
//
export default Factory;