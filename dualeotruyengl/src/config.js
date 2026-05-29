let BASE_URL = 'https://dualeotruyengl.com';

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
    let next = doc.select(
        'a[rel=next], a.next-page, a.page-next, ' +
        '.pagination a.next, .pagination li.next a, ' +
        'nav.pagination a[rel=next], [class*=pagination] a.next, ' +
        '.paginattion a.next, ul.pagination li:last-child a'
    ).first();
    if (next) {
        let href = normalizeUrl(next.attr('href') || '');
        if (href && href !== currentUrl) return href;
    }
    return '';
}
