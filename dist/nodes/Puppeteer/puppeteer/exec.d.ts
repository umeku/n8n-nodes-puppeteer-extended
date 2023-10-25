import { IBinaryData } from "n8n-workflow";
import { INodeParameters } from "./helpers";
export default function (nodeParameters: INodeParameters, executionId: string, continueOnFail: boolean): Promise<{
    binary?: {
        [key: string]: IBinaryData;
    } | undefined;
    json: {
        [key: string]: any;
    };
} | undefined>;
//# sourceMappingURL=exec.d.ts.map