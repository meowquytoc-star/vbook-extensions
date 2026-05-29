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
    url = normalizeUrl(url);
    try {
        let res = Http.get(url)
            .header('User-Agent', 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36')
            .header('Referer', BASE_URL + '/')
            .header('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
            .execute();
        if (res && res.ok) return res.html();
    } catch(e) {}
    let res2 = fetch(url);
    if (res2 && res2.ok) return res2.html();
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
    let found = null;
    doc.select('.pagination-number a').forEach(function(a) {
        let href = a.attr('href') || '';
        let m = href.match(/[?&]page=(\d+)/);
        if (m && parseInt(m[1]) === p + 1) found = normalizeUrl(href);
    });
    return found;
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
        data.push({ name: name, link: link, cover: cover, description: '', host: BASE_URL });
    });
    return data;
}

function execute() {
    return Response.success({ ok: true });
}
