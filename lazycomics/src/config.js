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
    let url = normalizeUrl(base).replace(/\?page=\d+/, '').replace(/\/+$/, '');
    return url + '?page=' + p;
}

function nextPage(doc, currentPage) {
    let p = parseInt(currentPage) || 1;
    let next = null;
    doc.select('.pagination-number a').forEach(function(a) {
        let href = a.attr('href') || '';
        let m = href.match(/[?&]page=(\d+)/);
        if (m && parseInt(m[1]) === p + 1) next = normalizeUrl(href);
    });
    return next;
}

function coverUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith('/storage/')) return BASE_URL + path;
    return BASE_URL + '/storage/' + path;
}

function parseComicItems(doc) {
    let data = [];
    let seen = {};
    doc.select('.comic-item').forEach(function(item) {
        let a = item.select('a').first();
        if (!a) return;
        let link = normalizeUrl(a.attr('href') || '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let name = cleanText(item.select('.comic-title, h3').first()
            ? item.select('.comic-title, h3').first().text() : a.attr('title') || '');
        let img = item.select('img').first();
        let cover = '';
        if (img) cover = coverUrl(img.attr('src') || img.attr('data-src') || '');
        data.push({ name: name, link: link, cover: cover });
    });
    return data;
}

function execute() {
    return Response.success({ ok: true });
}
