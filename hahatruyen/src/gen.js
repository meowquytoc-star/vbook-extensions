load('config.js');

// Pure-JS base64 decoder + UTF-8 restore for Vietnamese text
function myAtob(b64) {
    let t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let o = '';
    b64 = ('' + b64).replace(/[^A-Za-z0-9+\/=]/g, '');
    for (let i = 0; i < b64.length;) {
        let e1 = t.indexOf(b64[i++]), e2 = t.indexOf(b64[i++]);
        let e3 = t.indexOf(b64[i++]), e4 = t.indexOf(b64[i++]);
        o += String.fromCharCode((e1 << 2) | (e2 >> 4));
        if (e3 !== 64) o += String.fromCharCode(((e2 & 15) << 4) | (e3 >> 2));
        if (e4 !== 64) o += String.fromCharCode(((e3 & 3) << 6) | e4);
    }
    try { return decodeURIComponent(escape(o)); } catch(e) { return o; }
}

// Parse articles from decoded HTML string using regex
function parseArticlesHtml(html) {
    let items = [];
    let seen = {};
    let covers = [];
    let imgRe = /src="(https?:\/\/hahatruyen\.com\.vn\/img\/[^"]+)"/gi;
    let im;
    while ((im = imgRe.exec(html)) !== null) covers.push(im[1]);
    let re = /<h3[^>]*>[\s\S]*?<a[^>]+href="(https?:\/\/hahatruyen\.com\.vn\/vi\/\d+\/[^"]+)"[^>]*>\s*([^<]+)\s*<\/a>/gi;
    let m, idx = 0;
    while ((m = re.exec(html)) !== null) {
        let link = m[1], name = m[2].trim();
        if (!link || !name || seen[link]) continue;
        seen[link] = true;
        items.push({ name: name, link: link, cover: covers[idx] || '', description: '', host: BASE_URL });
        idx++;
    }
    return items;
}

function execute(url, page) {
    let p = parseInt(page) || 1;
    if (p === 1) {
        let doc = getDoc(url);
        if (!doc) return Response.error("Cannot load page.");
        let data = parseArticles(doc);
        if (data.length === 0) return Response.error("No stories found.");
        return Response.success(data, '2');
    }
    // Pages 2+: AJAX API returns base64-encoded HTML (status 201 = no more pages)
    let catId = extractCatId(url);
    if (!catId) return Response.error("Cannot get category ID.");
    let apiUrl = BASE_URL + '/getwh/ptm/' + catId + '/' + p;
    let res;
    try {
        res = Http.get(apiUrl)
            .header('User-Agent', 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36')
            .header('Referer', url)
            .execute();
    } catch(e) { res = fetch(apiUrl); }
    if (!res || !res.ok) return Response.success([], null);
    let b64 = res.text();
    if (!b64 || b64.length < 10) return Response.success([], null);
    let html = myAtob(b64);
    let data = parseArticlesHtml(html);
    if (data.length === 0) return Response.success([], null);
    return Response.success(data, String(p + 1));
}
