import { INodeExecutionData, INodeType, INodeTypeDescription, ILoadOptionsFunctions, INodePropertyOptions, IExecuteFunctions } from "n8n-workflow";
export declare class Puppeteer implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getDevices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
//# sourceMappingURL=Puppeteer.node.d.ts.map