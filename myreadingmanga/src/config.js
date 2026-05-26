let BASE_URL = 'https://myreadingmanga.info';
try { if (CONFIG_URL) BASE_URL = CONFIG_URL; } catch(e) {}

function cleanText(text) {
    if (!text) return '';
    return ('' + text).replace(/\s+/g, ' ').trim();
}

function normalizeUrl(url) {
    if (!url) return '';
    url = ('' + url).replace(/&amp;/g, '&').trim();
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return BASE_URL + url;
    if (!/^https?:\/\//i.test(url)) return BASE_URL + '/' + url;
    return url;
}

function normalizeImage(url) {
    return normalizeUrl(url);
}

function getDoc(url) {
    let res = fetch(normalizeUrl(url));
    if (res && res.ok) return res.html();
    return null;
}

function isStoryUrl(url) {
    if (!url) return false;
    let path = ('' + url).replace(/^https?:\/\/[^/]+/, '').replace(/\?.*$/, '').replace(/\/+$/, '');
    if (!path || path.length < 3) return false;
    if (/^\/(tag|category|page|author|feed|wp-|search|cdn-cgi)/i.test(path)) return false;
    return /^\/[a-zA-Z0-9][a-zA-Z0-9\-]{2,}$/.test(path);
}

function listPageUrl(base, page) {
    if (!page || page === '1' || page === 1) return normalizeUrl(base);
    let p = '' + page;
    if (/^https?:\/\//i.test(p) || p.startsWith('/')) return normalizeUrl(p);
    let url = normalizeUrl(base).replace(/\/+$/, '');
    if (url.indexOf('?') >= 0) return url + '&paged=' + p;
    return url + '/page/' + p + '/';
}

function nextPage(doc) {
    let el = doc.select('a.next.page-numbers, .nav-links a.next, a[rel=next]').first();
    return el ? normalizeUrl(el.attr('href')) : null;
}

function imageAttr(e) {
    let ss = e.attr('data-srcset') || e.attr('srcset');
    if (ss) return cleanText(ss.split(',')[0].split(' ')[0]);
    return e.attr('data-original') || e.attr('data-src') || e.attr('data-lazy-src') || e.attr('src') || '';
}

function firstText(doc, sels) {
    for (let i = 0; i < sels.length; i++) {
        let n = doc.select(sels[i]).first();
        let t = n ? cleanText(n.text()) : '';
        if (t) return t;
    }
    return '';
}

function execute() {
    return Response.success({ ok: true });
}
