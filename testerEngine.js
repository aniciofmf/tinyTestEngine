const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const skipDirs = ["node_modules"];

class TesterEngine {
	constructor() {
		this.filesToTest = [];
	}

	async executeTests() {
		for (let file of this.filesToTest) {
			console.log(chalk.yellow(`---- ${file.shortName}`));

			const beforeEaches = [];
			global.beforeEach = (fn) => {
				beforeEaches.push(fn);
			};

			global.it = async (desc, fn) => {
				beforeEaches.forEach((func) => func());
				try {
					await fn();
					console.log(chalk.green(`\tPassed - ${desc}`));
				} catch (err) {
					const message = err.message.replace(/\n/g, "\n\t\t");
					console.log(chalk.red(`\tFailed - ${desc}`));
					console.log(chalk.red("\t", message));
				}
			};

			try {
				require(file.name);
			} catch (err) {
				console.log(chalk.red(err));
			}
		}
	}

	async iterateOverPath(pathDir) {
		const files = await fs.promises.readdir(pathDir);

		for (let file of files) {
			const pathFile = path.join(pathDir, file);
			const fileStats = await fs.promises.lstat(pathFile);

			if (fileStats.isFile() && file.includes(".test.js")) {
				this.filesToTest.push({ name: pathFile, shortName: file });
			} else if (fileStats.isDirectory() && !skipDirs.includes(file)) {
				const childFiles = await fs.promises.readdir(pathFile);

				files.push(...childFiles.map((f) => path.join(file, f)));
			}
		}
	}
}

module.exports = TesterEngine;
