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
    let res = fetch(normalizeUrl(url));
    if (res && res.ok) return res.html();
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
