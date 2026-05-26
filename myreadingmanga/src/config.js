let BASE_URL = 'https://myreadingmanga.info';
try { if (CONFIG_URL) BASE_URL = CONFIG_URL; } catch (e) {}

function cleanText(text) {
    if (!text) return "";
    return ("" + text).replace(/\s+/g, " ").trim();
}

function stripTrailingSlash(url) {
    if (!url) return url;
    return ("" + url).replace(/\/+$/, "");
}

function normalizeUrl(url) {
    if (!url) return url;
    url = ("" + url).replace(/&amp;/g, "&").trim();
    if (url.startsWith("//")) return "https:" + url;
    if (url.startsWith("/")) return stripTrailingSlash(BASE_URL) + url;
    if (!/^https?:\/\//i.test(url)) return stripTrailingSlash(BASE_URL) + "/" + url.replace(/^\/+/, "");
    return url;
}

function normalizeImage(url) {
    return normalizeUrl(url);
}

function isChallenge(doc) {
    if (!doc) return true;
    let html = "";
    try { html = doc.html ? doc.html() : ""; } catch (e) {}
    let title = "";
    try { title = cleanText(doc.select("title").text()); } catch (e) {}
    return title.indexOf("Just a moment") >= 0 ||
        html.indexOf("cf-chl") >= 0 ||
        html.indexOf("window._cf_chl_opt") >= 0 ||
        html.indexOf("Enable JavaScript and cookies") >= 0 ||
        html.indexOf("Verification Required") >= 0;
}

function browserDoc(url) {
    try {
        let browser = Engine.newBrowser();
        browser.setUserAgent(UserAgent.android());
        let doc = browser.launch(normalizeUrl(url), 35000);
        for (let i = 0; i < 6 && isChallenge(doc); i++) {
            sleep(5000);
            doc = browser.html();
        }
        browser.close();
        return isChallenge(doc) ? null : doc;
    } catch (e) {
        return null;
    }
}

function getDoc(url) {
    try {
        let res = fetch(normalizeUrl(url), {
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": BASE_URL + "/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36"
            }
        });
        if (res.ok) {
            let doc = res.html();
            if (!isChallenge(doc)) return doc;
        }
    } catch (e) {}
    return browserDoc(url);
}

// A story URL is a direct slug: /some-slug-here  (no /tag/, /page/, /category/ etc.)
function isStoryUrl(url) {
    if (!url) return false;
    url = ("" + url).replace(/&amp;/g, "&");
    let path = url.replace(/^https?:\/\/[^/]+/, "").replace(/\?.*$/, "").replace(/\/+$/, "");
    if (!path) return false;
    // Exclude WordPress utility paths
    if (/^\/(tag|category|page|author|feed|wp-|search|cdn-cgi|wp-login|wp-admin)(\/|$)/i.test(path)) return false;
    // Must be a single-level slug of letters/numbers/hyphens, at least 3 chars
    return /^\/[a-z0-9][a-z0-9\-]{2,}$/.test(path);
}

// Wordpress pagination: appends /page/N/ to archive URLs, or &paged=N to query strings
function listPageUrl(base, page) {
    if (!page || page === "1" || page === 1) return normalizeUrl(base);
    let p = "" + page;
    if (/^https?:\/\//i.test(p) || p.startsWith("/")) return normalizeUrl(p);
    let url = stripTrailingSlash(normalizeUrl(base));
    if (url.indexOf("?") >= 0) return url + "&paged=" + p;
    return url + "/page/" + p + "/";
}

function nextPage(doc) {
    let el = doc.select("a.next.page-numbers, .nav-links a.next, .pagination a.next, a[rel='next']").first();
    if (el) return normalizeUrl(el.attr("href"));
    return null;
}

function firstText(doc, selectors) {
    for (let i = 0; i < selectors.length; i++) {
        let node = doc.select(selectors[i]).first();
        let text = node ? cleanText(node.text()) : "";
        if (text) return text;
    }
    return "";
}

function firstHtml(doc, selectors) {
    for (let i = 0; i < selectors.length; i++) {
        let node = doc.select(selectors[i]).first();
        if (node && node.html()) return node.html();
    }
    return "";
}

function execute() {
    return Response.success({ baseUrl: BASE_URL, ok: true });
}
