"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const puppeteer_extra_plugin_recaptcha_1 = __importDefault(require("puppeteer-extra-plugin-recaptcha"));
async function default_1(globalOptions) {
    const launchArguments = globalOptions.launchArguments || {};
    const headless = globalOptions.headless;
    const executablePath = globalOptions.executablePath;
    const stealth = globalOptions.stealth === true;
    const recaptcha = globalOptions.recaptcha === false;
    const launchArgs = launchArguments.args;
    const args = [];
    if (launchArgs && launchArgs.length > 0) {
        args.push(...launchArgs.map((arg) => arg.arg));
    }
    if (globalOptions.proxyServer) {
        args.push(`--proxy-server=${globalOptions.proxyServer}`);
    }
    if (stealth) {
        puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
    }
    if (recaptcha) {
        puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_recaptcha_1.default)({
            provider: {
                id: '',
                token: ''
            },
            visualFeedback: true
        }));
    }
    const browser = await puppeteer_extra_1.default
        .launch({
        headless,
        args,
        executablePath,
    })
        .catch((e) => console.log(e));
    return browser !== null && browser !== void 0 ? browser : undefined;
}
exports.default = default_1;
//# sourceMappingURL=start.js.map