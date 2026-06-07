let BASE_URL = 'https://lazycomics.net';
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

function coverUrl(u) {
    if (!u) return '';
    u = ('' + u).trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith('//')) return 'https:' + u;
    if (u.startsWith('/storage/')) return BASE_URL + u;
    if (u.startsWith('/')) return BASE_URL + u;
    return BASE_URL + '/storage/' + u;
}

function imgSrc(el) {
    if (!el) return '';
    return el.attr('data-src') || el.attr('data-lazy-src') ||
           el.attr('data-original') || el.attr('src') || '';
}

function getDoc(url) {
    url = absUrl(url);
    try {
        let res = Http.get(url)
            .header('User-Agent', UA)
            .header('Referer', BASE_URL + '/')
            .header('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
            .execute();
        if (res && res.ok) return res.html();
    } catch (e) {}
    try {
        let r = fetch(url);
        if (r && r.ok) return r.html();
    } catch (e) {}
    return null;
}

function pageUrl(base, page) {
    let p = parseInt(page) || 1;
    let u = absUrl(base).replace(/[?&]page=\d+/, '').replace(/\/+$/, '');
    if (p <= 1) return u;
    return u + (u.indexOf('?') > -1 ? '&' : '?') + 'page=' + p;
}

function hasNextPage(doc, currentPage) {
    let next = doc.select('a[rel=next], a.next-page, a.page-next, .pagination a.next, li.next a').first();
    if (next && next.attr('href')) return true;
    let p = parseInt(currentPage) || 1;
    let found = false;
    doc.select('.pagination a, [class*=pagination] a').forEach(function (a) {
        let m = (a.attr('href') || '').match(/[?&]page=(\d+)/);
        if (m && parseInt(m[1]) === p + 1) found = true;
    });
    return found;
}

function parseStoryList(doc) {
    let data = [];
    let seen = {};
    let sel = '.comic-item, .manga-item, .story-item, [class*=comic-item], [class*=manga-item]';
    let items = doc.select(sel);
    if (!items || items.size() === 0) {
        items = doc.select('article, .item').filter(function (el) {
            return el.select('a[href*="/truyen/"]').size() > 0;
        });
    }
    items.forEach(function (item) {
        let a = item.select('a[href*="/truyen/"]').first() || item.select('a').first();
        if (!a) return;
        let link = absUrl(a.attr('href') || '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let titleEl = item.select('.comic-title, .manga-title, h3, h4, .title').first();
        let name = cleanText(titleEl ? titleEl.text() : (a.attr('title') || a.text()));
        let cover = coverUrl(imgSrc(item.select('img').first()));
        data.push({ name: name, link: link, cover: cover, description: '', host: BASE_URL });
    });
    return data;
}

function execute() {
    return Response.success({ ok: true });
}
