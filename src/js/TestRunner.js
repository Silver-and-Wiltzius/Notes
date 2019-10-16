import F from "./Factory";

class TestRunner {
	runTests(zOutput) {
		const t = new F.TestEngine();

		function show(s) {
			zOutput.appendLine(s);
		}

		t.setShowSuccess(show);
		t.setShowFailure(show);
		t.setShowDone(show);
		t.testClasses(F.classes());
	}
}

export {TestRunner};