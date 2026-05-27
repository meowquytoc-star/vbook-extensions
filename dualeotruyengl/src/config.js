let BASE_URL = 'https://dualeotruyengl.com';

function getDoc(url) {
    let res = fetch(url);
    if (res && res.ok) return res.html();
    return null;
}

function normalizeUrl(href) {
    if (!href) return '';
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return 'https:' + href;
    if (href.startsWith('/')) return BASE_URL + href;
    return BASE_URL + '/' + href;
}

function cleanText(t) {
    if (!t) return '';
    return t.replace(/\s+/g, ' ').trim();
}

function parseListing(doc) {
    let items = [];
    let seen = {};
    doc.select('.li_truyen').forEach(function(e) {
        let a = e.select('a').first();
        if (!a) return;
        let link = normalizeUrl(a.attr('href') || '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let name = cleanText(e.select('.name').first() ? e.select('.name').first().text() : a.attr('title') || '');
        if (!name) name = cleanText(a.text());
        let img = e.select('img').first();
        let cover = '';
        if (img) cover = img.attr('data-src') || img.attr('src') || '';
        if (cover && cover.startsWith('//')) cover = 'https:' + cover;
        items.push({ name: name, link: link, cover: cover, description: '', host: BASE_URL });
    });
    return items;
}

function nextPageUrl(doc, currentUrl) {
    let next = doc.select('nav.pagination a[rel=next], .pagination a.next, a.next-page').first();
    if (next) return normalizeUrl(next.attr('href') || '');
    return '';
}
