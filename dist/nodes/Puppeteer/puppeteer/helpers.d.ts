export interface INodeParameters {
    url: string;
    queryParameters: {
        parameter: {
            name: string;
            value: string;
        }[];
    };
    output: {
        [key: string]: any;
    };
    globalOptions: {
        [key: string]: any;
    };
    nodeOptions: {
        [key: string]: any;
    };
    interactions: {
        parameter: {
            selector: string;
            value?: string;
            waitForNavigation?: boolean;
        }[];
    };
}
export declare const ipcRequest: (type: string, parameters: any) => Promise<any>;
//# sourceMappingURL=helpers.d.ts.map