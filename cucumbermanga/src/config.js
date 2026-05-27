let BASE_URL = 'https://cucumbermanga.com';

function getDoc(url) {
    try {
        let res = Http.get(url)
            .header('User-Agent', 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36')
            .header('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
            .header('Referer', BASE_URL + '/')
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

function parseMadaraListing(doc) {
    let items = [];
    let seen = {};
    doc.select('.page-item-detail, .manga-item, .c-image-hover').forEach(function(e) {
        let a = e.select('a').first();
        if (!a) return;
        let link = normalizeUrl(a.attr('href') || '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let name = cleanText(e.select('.post-title, h3, h4').first() ? e.select('.post-title, h3, h4').first().text() : a.attr('title') || a.text());
        let img = e.select('img').first();
        let cover = '';
        if (img) cover = img.attr('data-src') || img.attr('src') || '';
        if (cover.startsWith('//')) cover = 'https:' + cover;
        items.push({ name: name, link: link, cover: cover, description: '', host: BASE_URL });
    });
    return items;
}

function nextPageUrl(doc) {
    let next = doc.select('a.next.page-numbers, a[rel=next]').first();
    if (next) return normalizeUrl(next.attr('href') || '');
    return '';
}
