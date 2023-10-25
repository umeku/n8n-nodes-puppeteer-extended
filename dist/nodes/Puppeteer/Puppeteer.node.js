"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Puppeteer = void 0;
const puppeteer_1 = require("puppeteer");
const Puppeteer_node_options_1 = require("./Puppeteer.node.options");
const helpers_1 = require("./puppeteer/helpers");
const puppeteer_2 = __importDefault(require("./puppeteer"));
if (!process.send)
    (0, puppeteer_2.default)();
class Puppeteer {
    constructor() {
        this.description = Puppeteer_node_options_1.nodeDescription;
        this.methods = {
            loadOptions: {
                async getDevices() {
                    const returnData = [];
                    for (const [name, device] of Object.entries(puppeteer_1.KnownDevices)) {
                        returnData.push({
                            name,
                            value: name,
                            description: `${device.viewport.width} x ${device.viewport.height} @ ${device.viewport.deviceScaleFactor}x`,
                        });
                    }
                    return returnData;
                },
            },
        };
    }
    async execute() {
        var _a, e_1, _b, _c;
        let returnData = [];
        const credentials = (await this.getCredentials("n8nApi"));
        const executionId = this.getExecutionId();
        const globalOptions = this.getNodeParameter("globalOptions", 0, {});
        const nodeOptions = this.getNodeParameter("nodeOptions", 0, {});
        const url = this.getNodeParameter("url", 0, {});
        const queryParameters = this.getNodeParameter("queryParameters", 0, {});
        const interactions = this.getNodeParameter("interactions", 0, {});
        const output = this.getNodeParameter("output", 0, {});
        const isStarted = await (0, helpers_1.ipcRequest)("launch", {
            globalOptions,
            executionId,
        }).catch((e) => {
            throw new Error(e);
        });
        if (isStarted) {
            console.log("exec", globalOptions);
            const res = await (0, helpers_1.ipcRequest)("exec", {
                nodeParameters: {
                    globalOptions,
                    nodeOptions,
                    url,
                    queryParameters,
                    interactions,
                    output,
                },
                executionId,
                continueOnFail: this.continueOnFail(),
            }).catch((e) => {
                throw new Error(e);
            });
            if (res) {
                if (res.binary) {
                    try {
                        for (var _d = true, _e = __asyncValues(Object.keys(res.binary)), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
                            _c = _f.value;
                            _d = false;
                            const key = _c;
                            const type = res.binary[key].type;
                            const binaryData = await this.helpers
                                .prepareBinaryData(Buffer.from(res.binary[key].data), undefined, type === "pdf"
                                ? "application/pdf"
                                : `image/${res.binary[key].type}`)
                                .catch((e) => console.log(e));
                            if (binaryData)
                                res.binary[key] = binaryData;
                            else
                                delete res.binary[key];
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                returnData = [res];
            }
        }
        (0, helpers_1.ipcRequest)("check", {
            executionId,
            apiKey: credentials.apiKey,
            baseUrl: credentials.baseUrl,
        });
        return this.prepareOutputData(returnData);
    }
}
exports.Puppeteer = Puppeteer;
//# sourceMappingURL=Puppeteer.node.js.map