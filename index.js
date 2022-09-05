const TesterEngine = require("./testerEngine");
const tester = new TesterEngine();

const runTester = async () => {
	await tester.iterateOverPath(process.cwd());
	tester.executeTests();
};

runTester();
