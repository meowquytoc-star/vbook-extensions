let BASE_URL = 'https://cucumbermanga.com';
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
    s = s.trim();
    if (s.startsWith('//')) s = 'https:' + s;
    return s;
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

function listingPageUrl(url, page) {
    let p = parseInt(page) || 1;
    if (p <= 1) return url;
    let base = url.replace(/\/page\/\d+\/?/, '/').replace(/\?/, '/?').replace(/\/?$/, '/');
    let qIdx = base.indexOf('?');
    if (qIdx > -1) {
        return base.substring(0, qIdx).replace(/\/?$/, '/') + 'page/' + p + '/' + base.substring(qIdx);
    }
    return base + 'page/' + p + '/';
}

function parseMadaraListing(doc) {
    let items = [];
    let seen = {};
    let sel = '.page-item-detail, .manga-item, .c-image-hover, .c-tabs-item__content';
    doc.select(sel).forEach(function (e) {
        let a = e.select('a[href*="/manga/"], a[href*="/manga-"], a').first();
        if (!a) return;
        let link = absUrl(a.attr('href') || '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let titleEl = e.select('.post-title, h3, h4, .title').first();
        let name = cleanText(titleEl ? titleEl.text() : (a.attr('title') || a.text()));
        let cover = imgSrc(e.select('img').first());
        items.push({ name: name, link: link, cover: cover, description: '', host: BASE_URL });
    });
    return items;
}

function nextPageUrl(doc) {
    let next = doc.select(
        'a.next.page-numbers, a.page-numbers.next, a[rel=next], ' +
        '.nav-links a.next, .pagination a.next, nav.navigation a.next, ' +
        '.wp-pagenavi a.nextpostslink, a.nextpostslink'
    ).first();
    return next ? absUrl(next.attr('href') || '') : '';
}

function execute() {
    return Response.success({ ok: true });
}
