export const getRequest = () => {
    let url = location.search;
    let theRequest: any = {};
    if (url.indexOf("?") != -1) {
        let str: string = url.substr(1);
        let strs: string[] = str.split("&");
        for (let i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

export function objToStrMap(obj: any) {
    const strMap = new Map();
    for (const k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}
