import {Browser} from "puppeteer";
import ipc from "node-ipc";
import {IDataObject} from "n8n-workflow";
import axios from "axios";
import start from "./start";
import exec from "./exec";
import state from "./state";
import {INodeParameters} from "./helpers";
import {EVENT_TYPES} from "../constants";

export default function () {
	ipc.config.id = "puppeteer";
	ipc.config.retry = 1500;

	ipc.serve(function () {
		ipc.server.on(
			"launch",
			async (
				data: { globalOptions: IDataObject; executionId: string },
				socket: any
			) => {
				try {
					console.log('[Index][IPC] On Launch', data);
					let browser: Browser | void;
					if (!state.executions[data.executionId]?.browser) {
						browser = await start(data.globalOptions);
						if (browser) state.executions[data.executionId] = {browser};
					}
					console.log('[Index][IPC] Emit Launch')
					ipc.server.emit(
						socket,
						"launch",
						!!state.executions[data.executionId]?.browser
					);
				} catch (e: any) {
					ipc.server.emit(
						socket,
						"launch",
						`${EVENT_TYPES.ERROR}: ${e.message}`
					);
				}
			}
		);

		ipc.server.on(
			"exec",
			async (
				data: {
					nodeParameters: INodeParameters;
					executionId: string;
					continueOnFail: boolean;
				},
				socket: any
			) => {
				try {
					const returnData = await exec(
						data.nodeParameters,
						data.executionId,
						data.continueOnFail
					);

					ipc.server.emit(socket, "exec", returnData);
				} catch (e: any) {
					ipc.server.emit(socket, "exec", `${EVENT_TYPES.ERROR}: ${e.message}`);
				}
			}
		);

		ipc.server.on(
			"check",
			async (
				data: { executionId: string; apiKey: string; baseUrl: string },
				socket: any
			) => {
				ipc.server.emit(socket, "check", true);
				if (
					data.executionId &&
					data.apiKey &&
					state.executions[data.executionId] &&
					!state.executions[data.executionId]?.checked
				) {
					state.executions[data.executionId].checked = true;
					const checkExecution = async (
						executionId: string,
						apiKey: string,
						baseUrl: string
					) => {
						const headers = {
							accept: "application/json",
							"X-N8N-API-KEY": apiKey,
						};
						const res = await axios
							.get(`${baseUrl}/executions/${executionId}`, {
								headers,
							})
							.catch((e) => e);
						if (
							res &&
							res.data &&
							res.data.finished === false &&
							res.data.stoppedAt === null
						) {
							setTimeout(() => {
								checkExecution(executionId, apiKey, baseUrl);
							}, 3000);
						} else if (state.executions[executionId]?.browser) {
							// stop puppeteer
							await state.executions[executionId]?.browser.close();
							delete state.executions[executionId];
						}
					};
					checkExecution(data.executionId, data.apiKey, data.baseUrl);
				}
			}
		);
	});

	ipc.server.start();
}
