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
const puppeteer_1 = require("puppeteer");
const state_1 = __importDefault(require("./state"));
async function pageContent(getPageContent, page) {
    const { dataPropertyName, cssSelector, htmlToJson: hasHtmlToJson, innerHtml: hasInnerHtml, selectAll: hasSelectAll, noAttributes: hasNoAttributes, } = getPageContent;
    return await new Promise(async (resolve, reject) => {
        let content;
        if (hasHtmlToJson) {
            content = await page
                .evaluate((cssSelector, hasSelectAll, hasNoAttributes) => {
                function cleanText(text) {
                    const replaced = text
                        .replace(/\\n+/g, "\n")
                        .replace(/\s+/g, " ")
                        .trim();
                    if (replaced === "\n")
                        return "";
                    return replaced;
                }
                function htmlToJson(element) {
                    if (element.nodeType === 1 || element.nodeType === 9) {
                        const attributes = {};
                        if (element.attributes && !hasNoAttributes) {
                            for (let j = 0; j < element.attributes.length; j++) {
                                attributes["@" + element.attributes[j].nodeName] =
                                    element.attributes[j].nodeValue;
                            }
                        }
                        let value;
                        if (element.childNodes.length === 1 &&
                            element.childNodes[0].nodeName === "#text") {
                            value = cleanText(element.childNodes[0].textContent);
                            if (!Object.keys(attributes).length)
                                return value;
                        }
                        else {
                            value = {};
                            for (let j = 0; j < element.childNodes.length; j++) {
                                const childNode = element.childNodes[j];
                                const nodeName = childNode.nodeName.toLowerCase();
                                if (!value[nodeName])
                                    value[nodeName] = childNode;
                                else if (Array.isArray(value[nodeName]))
                                    value[nodeName].push(childNode);
                                else
                                    value[nodeName] = [value[nodeName], childNode];
                            }
                        }
                        if (value && typeof value === "object")
                            delete value["#comment"];
                        return Object.assign(Object.assign({}, attributes), (typeof value === "object"
                            ? Object.assign({}, value) : { "#text": cleanText(value) }));
                    }
                    return "";
                }
                function recursiveHtmlToJson(element) {
                    if (typeof element === "object") {
                        Object.keys(element).forEach((key) => {
                            if (!/@/.test(key)) {
                                if (Array.isArray(element[key])) {
                                    element[key].forEach((child, j) => {
                                        if (child.nodeType && child.nodeType === 1) {
                                            element[key][j] = htmlToJson(child);
                                            recursiveHtmlToJson(element[key][j]);
                                        }
                                        else if (child.nodeType && child.nodeType === 3) {
                                            element[key][j] = cleanText(child.textContent);
                                        }
                                    });
                                    element[key] = element[key].filter((e) => {
                                        if (typeof e === "string" && e)
                                            return e;
                                        if (Object.keys(e).length)
                                            return e;
                                    });
                                    if (element[key].length === 1)
                                        element[key] = element[key][0];
                                    else if (!element[key].length)
                                        delete element[key];
                                }
                                else {
                                    const nodeType = element[key].nodeType;
                                    if (nodeType && nodeType === 1) {
                                        element[key] = htmlToJson(element[key]);
                                        recursiveHtmlToJson(element[key]);
                                        if (!element[key])
                                            delete element[key];
                                        if (typeof element[key] === "object" &&
                                            !Object.keys(element[key]).length)
                                            delete element[key];
                                    }
                                    else if (nodeType && nodeType === 3) {
                                        element[key] = cleanText(element[key].textContent);
                                        if (!element[key])
                                            delete element[key];
                                    }
                                }
                            }
                        });
                    }
                }
                const selection = [];
                if (cssSelector && hasSelectAll) {
                    document
                        .querySelectorAll(cssSelector)
                        .forEach((e) => selection.push(e));
                }
                else {
                    selection.push(cssSelector ? document.querySelector(cssSelector) : document);
                }
                let parsed = [];
                selection.forEach((e) => {
                    let current = htmlToJson(e);
                    recursiveHtmlToJson(current);
                    if (current && typeof current === "object") {
                        delete current["#comment"];
                        if (Object.keys(current).length === 1 && current["#text"]) {
                            current = current["#text"];
                        }
                    }
                    parsed.push(current);
                });
                return hasSelectAll ? parsed : parsed[0];
            }, cssSelector, hasSelectAll, hasNoAttributes)
                .catch((err) => reject(err));
        }
        else {
            content = cssSelector
                ? await page
                    .evaluate((cssSelector, hasInnerHtml, hasSelectAll) => {
                    var _a, _b;
                    if (cssSelector && hasSelectAll) {
                        const selection = [];
                        document.querySelectorAll(cssSelector).forEach((e) => {
                            selection.push(hasInnerHtml ? e.innerHTML : e.outerHTML);
                        });
                        return selection;
                    }
                    else
                        return hasInnerHtml
                            ? (_a = document.querySelector(cssSelector)) === null || _a === void 0 ? void 0 : _a.innerHTML
                            : (_b = document.querySelector(cssSelector)) === null || _b === void 0 ? void 0 : _b.outerHTML;
                }, cssSelector, hasInnerHtml, hasSelectAll)
                    .catch((err) => reject(err))
                : await page.content().catch((err) => reject(err));
        }
        resolve({ content, dataPropertyName });
    });
}
async function pageScreenshot(options, page) {
    const type = options.imageType;
    const fullPage = options.fullPage;
    const cssSelector = options.cssSelector;
    const screenshotOptions = {
        type,
        fullPage,
    };
    if (type !== "png") {
        const quality = options.quality;
        screenshotOptions.quality = quality;
    }
    let screenshot;
    if (cssSelector) {
        await page.waitForSelector(cssSelector);
        const element = await page.$(cssSelector);
        if (element) {
            screenshot = (await element.screenshot(Object.assign(Object.assign({}, screenshotOptions), { fullPage: false })));
        }
    }
    else {
        screenshot = (await page.screenshot(screenshotOptions));
    }
    if (screenshot)
        return { [options.dataPropertyName]: { type, data: screenshot } };
    return {};
}
async function pagePDF(options, page) {
    const dataPropertyName = options.dataPropertyName;
    const pageRanges = options.pageRanges;
    const displayHeaderFooter = options.displayHeaderFooter;
    const omitBackground = options.omitBackground;
    const printBackground = options.printBackground;
    const landscape = options.landscape;
    const preferCSSPageSize = options.preferCSSPageSize;
    const scale = options.scale;
    const margin = options.margin;
    let headerTemplate;
    let footerTemplate;
    let height;
    let width;
    let format;
    if (displayHeaderFooter === true) {
        headerTemplate = options.headerTemplate;
        footerTemplate = options.footerTemplate;
    }
    if (preferCSSPageSize !== true) {
        height = options.height;
        width = options.width;
        if (!height || !width) {
            format = options.format;
        }
    }
    const pdfOptions = {
        format,
        displayHeaderFooter,
        omitBackground,
        printBackground,
        landscape,
        headerTemplate,
        footerTemplate,
        preferCSSPageSize,
        scale,
        height,
        width,
        pageRanges,
        margin,
    };
    const pdf = (await page.pdf(pdfOptions));
    if (pdf)
        return { [dataPropertyName]: { type: "pdf", data: pdf } };
    return {};
}
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36";
const waitForTimeout = (milliseconds) => new Promise(r => setTimeout(r, milliseconds));
async function default_1(nodeParameters, executionId, continueOnFail) {
    let stateExecution = state_1.default.executions[executionId];
    if (stateExecution === undefined) {
        return;
    }
    const browser = stateExecution === null || stateExecution === void 0 ? void 0 : stateExecution.browser;
    if (!browser)
        return;
    const pageCaching = nodeParameters.globalOptions.pageCaching !== false;
    const run = async (nodeParameters) => {
        var _a, e_1, _b, _c, _d, e_2, _e, _f;
        var _g, _h, _j, _k, _l;
        if (stateExecution === undefined) {
            return;
        }
        const urlString = nodeParameters.url;
        let page, response;
        if (urlString) {
            const { parameter: someHeaders = [] } = (nodeParameters.globalOptions
                .headers || {});
            const queryParameters = (_h = (_g = nodeParameters.queryParameters) === null || _g === void 0 ? void 0 : _g.parameter) !== null && _h !== void 0 ? _h : [];
            const requestHeaders = someHeaders.reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {});
            const device = nodeParameters.globalOptions.device;
            const url = new URL(urlString);
            page = await browser.newPage();
            if (nodeParameters.globalOptions.viewport) {
                const viewport = nodeParameters.globalOptions.viewport;
                const { width, height } = viewport.size;
                await page.setViewport({ width, height });
            }
            await page.setCacheEnabled(pageCaching);
            if (device) {
                const emulatedDevice = puppeteer_1.KnownDevices[device];
                if (emulatedDevice) {
                    await page.emulate(emulatedDevice);
                }
            }
            else {
                const userAgent = requestHeaders["User-Agent"] ||
                    requestHeaders["user-agent"] ||
                    DEFAULT_USER_AGENT;
                await page.setUserAgent(userAgent);
            }
            await page.setExtraHTTPHeaders(requestHeaders);
            for (const queryParameter of queryParameters) {
                url.searchParams.append(queryParameter.name, queryParameter.value);
            }
            const waitUntil = (nodeParameters.nodeOptions.waitUntil ||
                nodeParameters.globalOptions.waitUntil);
            const timeout = nodeParameters.globalOptions.timeout;
            response = await page.goto(url.toString(), { waitUntil, timeout });
            stateExecution.previousPage = page;
            stateExecution.previousResponse = response;
        }
        else if ((stateExecution === null || stateExecution === void 0 ? void 0 : stateExecution.previousPage) &&
            (stateExecution === null || stateExecution === void 0 ? void 0 : stateExecution.previousResponse)) {
            page = stateExecution === null || stateExecution === void 0 ? void 0 : stateExecution.previousPage;
            response = stateExecution === null || stateExecution === void 0 ? void 0 : stateExecution.previousResponse;
            if (nodeParameters.nodeOptions.waitUntil)
                await page.waitForNavigation({
                    waitUntil: nodeParameters.nodeOptions.waitUntil,
                });
        }
        else {
            throw new Error("No previous page or response found");
        }
        if (nodeParameters.nodeOptions.timeToWait ||
            nodeParameters.globalOptions.timeToWait)
            await waitForTimeout((_j = nodeParameters.nodeOptions.timeToWait) !== null && _j !== void 0 ? _j : nodeParameters.globalOptions.timeToWait);
        if (nodeParameters.nodeOptions.waitForSelector ||
            nodeParameters.globalOptions.waitForSelector)
            await page.waitForSelector((_k = nodeParameters.nodeOptions.waitForSelector) !== null && _k !== void 0 ? _k : nodeParameters.globalOptions.waitForSelector, { timeout: 10000 });
        if (nodeParameters.nodeOptions.injectHtml ||
            nodeParameters.globalOptions.injectHtml) {
            await page.evaluate(async (nodeParameters, globalOptions) => {
                var _a;
                const img = document.createElement("img");
                img.style.display = "none";
                const div = document.createElement("div");
                const content = (_a = nodeParameters.nodeOptions.injectHtml) !== null && _a !== void 0 ? _a : nodeParameters.globalOptions.injectHtml;
                div.innerHTML = content;
                const promise = new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                document.body.appendChild(div);
                document.body.appendChild(img);
                img.src =
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";
                await promise;
            }, nodeParameters, nodeParameters.globalOptions);
        }
        if (nodeParameters.nodeOptions.injectCss ||
            nodeParameters.globalOptions.injectCss) {
            await page.evaluate(async (nodeParameters, globalOptions) => {
                var _a;
                const style = document.createElement("style");
                const content = (_a = nodeParameters.nodeOptions.injectCss) !== null && _a !== void 0 ? _a : nodeParameters.globalOptions.injectCss;
                style.appendChild(document.createTextNode(content));
                const promise = new Promise((resolve, reject) => {
                    style.onload = resolve;
                    style.onerror = reject;
                });
                document.head.appendChild(style);
                await promise;
            }, nodeParameters, nodeParameters.globalOptions);
        }
        if (nodeParameters.nodeOptions.injectJs ||
            nodeParameters.globalOptions.injectJs) {
            await page.evaluate(async (nodeParameters, globalOptions) => {
                var _a;
                const script = document.createElement("script");
                const content = (_a = nodeParameters.nodeOptions.injectJs) !== null && _a !== void 0 ? _a : nodeParameters.globalOptions.injectJs;
                script.appendChild(document.createTextNode(content));
                const promise = new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
                document.head.appendChild(script);
                await promise;
            }, nodeParameters, nodeParameters.globalOptions);
        }
        if (nodeParameters.interactions.parameter) {
            for (const p of nodeParameters.interactions.parameter) {
                if (p.value) {
                    await page.waitForSelector(p.selector, {
                        timeout: 10000,
                    });
                    await page.focus(p.selector);
                    await page.keyboard.type(p.value, { delay: 100 });
                }
                else {
                    await page.waitForSelector(p.selector, {
                        timeout: 10000,
                    });
                    const promises = [
                        page.evaluate((selector) => {
                            const elm = document.querySelector(selector);
                            elm.click();
                        }, p.selector),
                    ];
                    if (p.waitForNavigation) {
                        promises.push(page.waitForNavigation({
                            waitUntil: ["load", "networkidle2"],
                            timeout: 10000,
                        }));
                    }
                    await Promise.all(promises);
                }
                if (p.sendKeys) {
                    for (const sendKey of p.sendKeys.parameter) {
                        switch (sendKey.sendType) {
                            case 'up':
                                await page.keyboard.up(sendKey.key);
                                break;
                            case 'down':
                                await page.keyboard.down(sendKey.key);
                                break;
                            case 'press':
                                await page.keyboard.press(sendKey.key);
                                break;
                        }
                    }
                }
                if (p.timeToWait) {
                    await waitForTimeout(p.timeToWait);
                }
            }
        }
        const headers = await response.headers();
        const statusCode = response.status();
        let data = {
            json: {
                headers,
                statusCode,
            },
        };
        const getAllPageContent = async () => {
            const allPageContent = [];
            nodeParameters.output.getPageContent.forEach((options) => {
                allPageContent.push(pageContent(options, page));
            });
            const resolvedAllPageContent = await Promise.all(allPageContent).catch((e) => console.log(e));
            (resolvedAllPageContent !== null && resolvedAllPageContent !== void 0 ? resolvedAllPageContent : []).forEach((pageContent) => {
                data.json[pageContent.dataPropertyName] = pageContent.content;
            });
        };
        if (statusCode !== 200) {
            if (!continueOnFail) {
                if (nodeParameters.output.getPageContent)
                    await getAllPageContent();
            }
            else {
                throw new Error(`Request failed with status code ${statusCode}`);
            }
        }
        else {
            if (nodeParameters.output.getPageContent)
                await getAllPageContent();
            if (nodeParameters.output.getScreenshot) {
                const allScreenshot = [];
                for (const options of nodeParameters.output.getScreenshot) {
                    allScreenshot.push(pageScreenshot(options, page));
                }
                const resolvedAllPageScreenshot = await Promise.all(allScreenshot).catch((e) => console.log(e));
                (resolvedAllPageScreenshot !== null && resolvedAllPageScreenshot !== void 0 ? resolvedAllPageScreenshot : []).forEach((pageScreenshot) => {
                    var _a;
                    if (pageScreenshot) {
                        data.binary = Object.assign(Object.assign({}, ((_a = data.binary) !== null && _a !== void 0 ? _a : {})), pageScreenshot);
                    }
                });
            }
            if (nodeParameters.output.getPDF) {
                try {
                    for (var _m = true, _o = __asyncValues(nodeParameters.output.getPDF), _p; _p = await _o.next(), _a = _p.done, !_a; _m = true) {
                        _c = _p.value;
                        _m = false;
                        const options = _c;
                        const pdfBinary = await pagePDF(options, page);
                        if (pdfBinary) {
                            data.binary = Object.assign(Object.assign({}, ((_l = data.binary) !== null && _l !== void 0 ? _l : {})), pdfBinary);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_m && !_a && (_b = _o.return)) await _b.call(_o);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            if (nodeParameters.output.getCookie) {
                try {
                    for (var _q = true, _r = __asyncValues(nodeParameters.output.getCookie), _s; _s = await _r.next(), _d = _s.done, !_d; _q = true) {
                        _f = _s.value;
                        _q = false;
                        const options = _f;
                        const cookies = await page.cookies();
                        const ss = await page.evaluate(() => sessionStorage);
                        const ls = await page.evaluate(() => localStorage);
                        data.json[options.dataPropertyName] = {
                            cookies,
                            sessionStorage: ss,
                            localStorage: ls
                        };
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (!_q && !_d && (_e = _r.return)) await _e.call(_r);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        return data;
    };
    return await run(nodeParameters);
}
exports.default = default_1;
//# sourceMappingURL=exec.js.map