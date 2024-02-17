"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipcRequest = void 0;
const node_ipc_1 = __importDefault(require("node-ipc"));
const _ = __importStar(require("lodash"));
const constants_1 = require("../constants");
const ipcRequest = (type, parameters) => {
    return new Promise((resolve, reject) => {
        node_ipc_1.default.config.retry = 1500;
        node_ipc_1.default.connectTo("puppeteer", () => {
            var _a, _b;
            console.log(`[Helper][IPC] Emit ${type}`);
            (_a = node_ipc_1.default.of.puppeteer) === null || _a === void 0 ? void 0 : _a.emit(type, parameters);
            (_b = node_ipc_1.default.of.puppeteer) === null || _b === void 0 ? void 0 : _b.on(type, (data) => {
                console.log(`[Helper][IPC] On ${type}`, data);
                if (_.startsWith(data, constants_1.EVENT_TYPES.ERROR)) {
                    console.log(`[Helper][IPC] Error`, data);
                    reject(new Error(data));
                    return;
                }
                resolve(data);
            });
        });
    });
};
exports.ipcRequest = ipcRequest;
//# sourceMappingURL=helpers.js.map