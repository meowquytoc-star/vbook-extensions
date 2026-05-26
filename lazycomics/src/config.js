let BASE_URL = 'https://lazycomics.net';
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

function getDoc(url) {
    let res = fetch(normalizeUrl(url));
    if (res && res.ok) return res.html();
    return null;
}

function listPageUrl(base, page) {
    if (!page || page === '1' || page === 1) return normalizeUrl(base);
    let p = '' + page;
    if (/^https?:\/\//i.test(p)) return p;
    let url = normalizeUrl(base).replace(/\/+$/, '');
    let sep = url.indexOf('?') >= 0 ? '&' : '?';
    return url + sep + 'page=' + p;
}

function nextPage(doc) {
    let el = doc.select('a[rel=next], .pagination a.next, a.next').first();
    if (el) return normalizeUrl(el.attr('href'));
    return null;
}

function coverUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith('/storage/')) return BASE_URL + path;
    return BASE_URL + '/storage/' + path;
}

function execute() {
    return Response.success({ ok: true });
}
