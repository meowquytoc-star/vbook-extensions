let BASE_URL = 'https://teamsany.com';
try { if (typeof CONFIG_URL !== 'undefined' && CONFIG_URL) BASE_URL = CONFIG_URL; } catch (e) {}

const UA = 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36';

function cleanText(s) {
    if (s === null || s === undefined) return '';
    return ('' + s).replace(/\s+/g, ' ').trim();
}

function absUrl(u) {
    if (!u) return '';
    u = ('' + u).replace(/&amp;/g, '&').trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith('//')) return 'https:' + u;
    if (u.startsWith('/')) return BASE_URL + u;
    return BASE_URL + '/' + u;
}

function imgSrc(el) {
    if (!el) return '';
    let s = el.attr('data-src') || el.attr('data-lazy-src') ||
            el.attr('data-original') || el.attr('src') || '';
    return s.trim();
}

function getDoc(url) {
    url = absUrl(url);
    try {
        let res = Http.get(url)
            .header('User-Agent', UA)
            .header('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
            .header('Referer', BASE_URL + '/')
            .execute();
        if (res && res.ok) return res.html();
    } catch (e) {}
    try {
        let r = fetch(url);
        if (r && r.ok) return r.html();
    } catch (e) {}
    return null;
}

// teamsany.com dùng pagination kiểu WordPress: /manhwa/page/2/
function listPageUrl(base, page) {
    let p = parseInt(page) || 1;
    let url = absUrl(base).replace(/\/page\/\d+\/?/, '/').replace(/\/?$/, '/');
    if (p <= 1) return url;
    return url + 'page/' + p + '/';
}

function hasNextPage(doc, currentPage) {
    let next = doc.select('a[rel=next], a.next, .pagination a.next, .next.page-numbers, a.page-numbers.next').first();
    if (next && next.attr('href')) return true;
    let p = parseInt(currentPage) || 1;
    let found = false;
    doc.select('a.page-numbers, .pagination a').forEach(function (a) {
        let m = (a.attr('href') || '').match(/\/page\/(\d+)\//);
        if (m && parseInt(m[1]) >= p + 1) found = true;
    });
    return found;
}

function parseComicItems(doc) {
    let items = [];
    let seen = {};
    // teamsany.com: <article class="manga"> với div.title + img + a -> /manga/{slug}/
    // Selectors cũ (.comic-item) giữ làm fallback
    doc.select('article.manga, .comic-item').forEach(function (el) {
        let linkEl = el.select('a[href*="/manga/"]').first() ||
                     el.select('.comic-main-link').first() ||
                     el.select('a').first();
        if (!linkEl) return;
        let link = absUrl(linkEl.attr('href') || '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let titleEl = el.select('.title, .comic-title, h1, h2, h3, h4').first();
        let name = cleanText(titleEl ? titleEl.text() : (linkEl.attr('title') || linkEl.text()));
        if (!name) return;
        let cover = absUrl(imgSrc(el.select('img').first()));
        items.push({ name: name, link: link, cover: cover, description: '', host: BASE_URL });
    });
    return items;
}

function execute() {
    return Response.success({ ok: true });
}
