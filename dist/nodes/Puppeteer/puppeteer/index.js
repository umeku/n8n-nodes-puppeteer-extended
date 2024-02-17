"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_ipc_1 = __importDefault(require("node-ipc"));
const axios_1 = __importDefault(require("axios"));
const start_1 = __importDefault(require("./start"));
const exec_1 = __importDefault(require("./exec"));
const state_1 = __importDefault(require("./state"));
const constants_1 = require("../constants");
function default_1() {
    node_ipc_1.default.config.id = "puppeteer";
    node_ipc_1.default.config.retry = 1500;
    node_ipc_1.default.serve(function () {
        node_ipc_1.default.server.on("launch", async (data, socket) => {
            var _a, _b;
            try {
                console.log('[Index][IPC] On Launch', data);
                let browser;
                if (!((_a = state_1.default.executions[data.executionId]) === null || _a === void 0 ? void 0 : _a.browser)) {
                    browser = await (0, start_1.default)(data.globalOptions);
                    if (browser)
                        state_1.default.executions[data.executionId] = { browser };
                }
                console.log('[Index][IPC] Emit Launch');
                node_ipc_1.default.server.emit(socket, "launch", !!((_b = state_1.default.executions[data.executionId]) === null || _b === void 0 ? void 0 : _b.browser));
            }
            catch (e) {
                node_ipc_1.default.server.emit(socket, "launch", `${constants_1.EVENT_TYPES.ERROR}: ${e.message}`);
            }
        });
        node_ipc_1.default.server.on("exec", async (data, socket) => {
            try {
                const returnData = await (0, exec_1.default)(data.nodeParameters, data.executionId, data.continueOnFail);
                node_ipc_1.default.server.emit(socket, "exec", returnData);
            }
            catch (e) {
                node_ipc_1.default.server.emit(socket, "exec", `${constants_1.EVENT_TYPES.ERROR}: ${e.message}`);
            }
        });
        node_ipc_1.default.server.on("check", async (data, socket) => {
            var _a;
            node_ipc_1.default.server.emit(socket, "check", true);
            if (data.executionId &&
                data.apiKey &&
                state_1.default.executions[data.executionId] &&
                !((_a = state_1.default.executions[data.executionId]) === null || _a === void 0 ? void 0 : _a.checked)) {
                state_1.default.executions[data.executionId].checked = true;
                const checkExecution = async (executionId, apiKey, baseUrl) => {
                    var _a, _b;
                    const headers = {
                        accept: "application/json",
                        "X-N8N-API-KEY": apiKey,
                    };
                    const res = await axios_1.default
                        .get(`${baseUrl}/executions/${executionId}`, {
                        headers,
                    })
                        .catch((e) => e);
                    if (res &&
                        res.data &&
                        res.data.finished === false &&
                        res.data.stoppedAt === null) {
                        setTimeout(() => {
                            checkExecution(executionId, apiKey, baseUrl);
                        }, 3000);
                    }
                    else if ((_a = state_1.default.executions[executionId]) === null || _a === void 0 ? void 0 : _a.browser) {
                        await ((_b = state_1.default.executions[executionId]) === null || _b === void 0 ? void 0 : _b.browser.close());
                        delete state_1.default.executions[executionId];
                    }
                };
                checkExecution(data.executionId, data.apiKey, data.baseUrl);
            }
        });
    });
    node_ipc_1.default.server.start();
}
exports.default = default_1;
//# sourceMappingURL=index.js.map