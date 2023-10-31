import ipc from "node-ipc";
// import state from './state';

export interface INodeParameters {
	url: string;
	queryParameters: { parameter: { name: string; value: string }[] };
	output: { [key: string]: any };
	globalOptions: { [key: string]: any };
	nodeOptions: { [key: string]: any };
	interactions: {
		parameter: {
			selector: string;
			value?: string;
			sendKeys?: {
				parameter: {
					key: string,
					sendType: string
				}[]
			};
			waitForNavigation?: boolean;
			timeToWait?: number;
		}[];
	};
}

// todo timeout
export const ipcRequest = (type: string, parameters: any): Promise<any> => {
	return new Promise((resolve, reject) => {
		ipc.config.retry = 1500;
		ipc.connectTo("puppeteer", () => {
			console.log(`[Helper][IPC] Emit ${type}`)
			ipc.of.puppeteer?.emit(type, parameters);

			ipc.of.puppeteer?.on(type, (data: any) => {
				if(data instanceof Error) {
					console.log(`[Helper][IPC] Error ${type}`, data)
					reject(data)
					return
				}
				console.log(`[Helper][IPC] On ${type}`, data)
				resolve(data);
			});
		});
	});
};
