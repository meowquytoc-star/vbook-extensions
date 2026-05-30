let BASE_URL = 'https://hahatruyen.com.vn';
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
            .header('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
            .header('Accept-Language', 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7')
            .header('Referer', BASE_URL + '/')
            .header('Upgrade-Insecure-Requests', '1')
            .header('Cache-Control', 'max-age=0')
            .execute();
        if (res && res.ok) return res.html();
    } catch(e) {}
    let res2 = fetch(url);
    if (res2 && res2.ok) return res2.html();
    return null;
}

function extractCatId(url) {
    let m = ('' + url).match(/\/vi\/(\d+)\//);
    return m ? m[1] : null;
}

function listPageUrl(base, page) {
    if (!page || page === '1' || page === 1) return normalizeUrl(base);
    let p = '' + page;
    if (/^https?:\/\//i.test(p)) return p;
    let url = normalizeUrl(base).replace(/\/+$/, '');
    return url + '?page=' + p;
}

function nextPage(doc, url, page) {
    let catId = extractCatId(url);
    if (!catId) return null;
    let p = parseInt(page) || 1;
    return BASE_URL + '/getwh/ptm/' + catId + '/' + (p + 1);
}

function parseArticles(doc) {
    let data = [];
    let seen = {};
    doc.select('article.truyen-col').forEach(function(e) {
        let linkEl = e.select('h3 a').first();
        if (!linkEl) return;
        let link = normalizeUrl(linkEl.attr('href') || '');
        if (!link || seen[link]) return;
        let name = cleanText(linkEl.attr('title') || linkEl.text());
        if (!name) return;
        let imgEl = e.select('img.img_hover_zoom11, img').first();
        let cover = imgEl ? normalizeUrl(imgEl.attr('src') || '') : '';
        seen[link] = true;
        data.push({ name: name, link: link, cover: cover, description: '', host: BASE_URL });
    });
    return data;
}

function execute() {
    return Response.success({ ok: true });
}
