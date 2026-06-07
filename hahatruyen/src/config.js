let BASE_URL = 'https://hahatruyen.com.vn';
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
            .header('Accept-Language', 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7')
            .header('Referer', BASE_URL + '/')
            .header('Upgrade-Insecure-Requests', '1')
            .execute();
        if (res && res.ok) return res.html();
    } catch (e) {}
    try {
        let r = fetch(url);
        if (r && r.ok) return r.html();
    } catch (e) {}
    return null;
}

function extractCatId(url) {
    let m = ('' + url).match(/\/vi\/(\d+)\//);
    return m ? m[1] : null;
}

// Pure-JS base64 decoder + UTF-8 restore
function decodeB64(b64) {
    let t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let o = '';
    b64 = ('' + b64).replace(/[^A-Za-z0-9+\/=]/g, '');
    for (let i = 0; i < b64.length;) {
        let e1 = t.indexOf(b64[i++]);
        let e2 = t.indexOf(b64[i++]);
        let e3 = t.indexOf(b64[i++]);
        let e4 = t.indexOf(b64[i++]);
        o += String.fromCharCode((e1 << 2) | (e2 >> 4));
        if (e3 !== 64) o += String.fromCharCode(((e2 & 15) << 4) | (e3 >> 2));
        if (e4 !== 64) o += String.fromCharCode(((e3 & 3) << 6) | e4);
    }
    try { return decodeURIComponent(escape(o)); } catch (e) { return o; }
}

function parseArticles(doc) {
    let data = [];
    let seen = {};
    doc.select('article.truyen-col, article[class*=truyen]').forEach(function (e) {
        let linkEl = e.select('h3 a, h2 a, a.title').first() || e.select('a[href*="/vi/"]').first();
        if (!linkEl) return;
        let link = absUrl(linkEl.attr('href') || '');
        if (!link || seen[link]) return;
        let name = cleanText(linkEl.attr('title') || linkEl.text());
        if (!name) return;
        seen[link] = true;
        let cover = absUrl(imgSrc(e.select('img.img_hover_zoom11, img').first()));
        data.push({ name: name, link: link, cover: cover, description: '', host: BASE_URL });
    });
    return data;
}

// Parse listings from decoded AJAX HTML (regex-based, no DOM)
function parseArticlesHtml(html) {
    let items = [];
    let seen = {};
    let covers = [];
    let imgRe = /src="(https?:\/\/[^"]*hahatruyen[^"]*\/img\/[^"]+)"/gi;
    let im;
    while ((im = imgRe.exec(html)) !== null) covers.push(im[1]);

    let re = /<h3[^>]*>[\s\S]*?<a[^>]+href="(https?:\/\/[^"]*hahatruyen[^"]*\/vi\/\d+\/[^"]+)"[^>]*>\s*([^<]+)\s*<\/a>/gi;
    let m, idx = 0;
    while ((m = re.exec(html)) !== null) {
        let link = m[1];
        let name = cleanText(m[2]);
        if (!link || !name || seen[link]) continue;
        seen[link] = true;
        items.push({ name: name, link: link, cover: covers[idx] || '', description: '', host: BASE_URL });
        idx++;
    }
    return items;
}

function execute() {
    return Response.success({ ok: true });
}
