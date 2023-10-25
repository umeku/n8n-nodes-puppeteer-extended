import { Browser } from "puppeteer";
declare const state: {
    executions: {
        [key: string]: {
            browser: Browser;
            previousPage?: any;
            previousResponse?: any;
            checked?: boolean;
        };
    };
};
export default state;
//# sourceMappingURL=state.d.ts.map