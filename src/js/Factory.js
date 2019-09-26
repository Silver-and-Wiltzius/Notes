import {River} from "./River";
import {TestEngine} from "./TestEngine";
import {TestRunner} from "./TestRunner";
import {RenderEngine} from "./RenderEngine";
import {Storage} from "./Storage";
import {StorageFirestore} from "./StorageFirestore";
import {Finder} from "./Finder";

const Factory = {
	River: River,
	TestEngine: TestEngine,
	TestRunner: TestRunner,
	RenderEngine: RenderEngine,
	Storage: Storage,
	StorageFirestore: StorageFirestore,
	Finder: Finder,
	classes: function () {
		return Object.values(this);
	},
};
//
export default Factory;