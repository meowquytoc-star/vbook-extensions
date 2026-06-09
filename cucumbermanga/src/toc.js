load('config.js');

// Multi-strategy POST cho VBook iOS (không có chain .header() / .body())
// Trả về { html: <jsoupDoc>, text: <raw> } hoặc null
function postMulti(url, refererUrl, bodyStr) {
    let headers = {
        'User-Agent': UA,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': refererUrl
    };
    let res = null;

    // A. fetch(url, {method:'POST', headers, body}) — iOS đã verified
    if (!res) {
        try {
            res = fetch(url, { method: 'POST', headers: headers, body: bodyStr || '' });
        } catch (e) {}
    }
    // B. Http.post(url, {headers, body}) — alt API
    if (!res) {
        try {
            res = Http.post(url, { headers: headers, body: bodyStr || '' });
        } catch (e) {}
    }
    // C. Builder chain Android
    if (!res) {
        try {
            res = Http.post(url)
                .header('User-Agent', UA)
                .header('X-Requested-With', 'XMLHttpRequest')
                .header('Content-Type', 'application/x-www-form-urlencoded')
                .header('Referer', refererUrl)
                .body(bodyStr || '')
                .execute();
        } catch (e) {}
    }
    // D. fetch bare (no headers — last resort)
    if (!res) {
        try { res = fetch(url); } catch (e) {}
    }

    if (!res) return null;
    if (typeof res.ok !== 'undefined' && !res.ok) return null;

    let doc = null;
    try { doc = res.html(); } catch (e) {}
    let txt = '';
    try { txt = res.text(); } catch (e) {}
    if (!txt) try { txt = res.body; } catch (e) {}
    if (!txt) try { txt = res.body(); } catch (e) {}
    if (!txt && doc) try { txt = doc.html(); } catch (e) {}

    return { html: doc, text: txt };
}

function findPostId(doc) {
    let article = doc.select('article[id^="post-"]').first();
    if (article) {
        let m = (article.attr('id') || '').match(/post-(\d+)/);
        if (m) return m[1];
    }
    let el = doc.select('#manga-chapters-holder[data-id], [data-id], .wp-manga-action-button').first();
    if (el) {
        let v = el.attr('data-id') || el.attr('data-post') || '';
        if (v) return v;
    }
    let input = doc.select('input[name="manga"], #manga-id').first();
    if (input) return input.attr('value') || '';
    return '';
}

// Marker khi Jsoup không hoạt động: trả raw text bọc trong object
function markRawText(txt) { return { _rawHtml: txt }; }

function fetchChapterDoc(url) {
    let chapUrl = url.replace(/\/?$/, '/') + 'ajax/chapters/';
    let r = postMulti(chapUrl, url, '');
    if (!r) return null;
    if (r.html && r.html.select('li.wp-manga-chapter a, .wp-manga-chapter a').first()) return r.html;
    if (r.text && /wp-manga-chapter/.test(r.text)) return markRawText(r.text);
    return null;
}

function fetchChapterDocByPostId(url, postId) {
    if (!postId) return null;
    let r = postMulti(BASE_URL + '/wp-admin/admin-ajax.php', url,
                      'action=manga_get_chapters&manga=' + postId);
    if (!r) return null;
    if (r.html && r.html.select('li.wp-manga-chapter a, .wp-manga-chapter a').first()) return r.html;
    if (r.text && /wp-manga-chapter/.test(r.text)) return markRawText(r.text);
    return null;
}

function collect(scope, chapters, seen) {
    // Marker _rawHtml → parse bằng regex (Jsoup không có)
    if (scope && scope._rawHtml) {
        collectFromHtmlText(scope._rawHtml, chapters, seen);
        return;
    }
    scope.select('li.wp-manga-chapter a, .wp-manga-chapter a, .listing-chapters_wrap a').forEach(function (e) {
        let link = absUrl(e.attr('href') || '').replace(/[?#].*$/, '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let name = cleanText(e.text() || e.attr('title') || '') || 'Chapter';
        chapters.push({ name: name, url: link, host: BASE_URL });
    });
}

// Regex parser khi Jsoup không có / response không parse được
function collectFromHtmlText(htmlStr, chapters, seen) {
    if (!htmlStr) return;
    let aRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = aRe.exec(htmlStr)) !== null) {
        let link = m[1].replace(/&amp;/g, '&').replace(/[?#].*$/, '');
        if (!link || seen[link]) continue;
        if (link.indexOf('http') !== 0) link = absUrl(link);
        if (link.indexOf(BASE_URL) !== 0) continue;
        // Chỉ giữ link chapter — URL có /chapter hoặc /chap
        if (!/\/chapter|\/chap-/i.test(link)) continue;
        let inner = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (!inner) inner = 'Chapter';
        seen[link] = true;
        chapters.push({ name: inner, url: link, host: BASE_URL });
    }
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    let chapDoc = fetchChapterDoc(url);
    if (!chapDoc) chapDoc = fetchChapterDocByPostId(url, findPostId(doc));
    if (chapDoc) collect(chapDoc, chapters, seen);
    if (chapters.length === 0) collect(doc, chapters, seen);

    chapters.reverse();
    if (chapters.length === 0) return Response.error("No chapters found.");
    return Response.success(chapters);
}
