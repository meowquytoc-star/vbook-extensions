load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    // Extract manga post ID for Madara AJAX
    let postId = '';
    let articleEl = doc.select('article[id^="post-"]').first();
    if (articleEl) {
        let m = (articleEl.attr('id') || '').match(/post-(\d+)/);
        if (m) postId = m[1];
    }
    if (!postId) {
        let el = doc.select('#manga-chapters-holder, [data-id], .wp-manga-action-button').first();
        if (el) postId = el.attr('data-id') || el.attr('data-post') || '';
    }
    if (!postId) {
        let inputEl = doc.select('input[name="manga"], #manga-id').first();
        if (inputEl) postId = inputEl.attr('value') || '';
    }

    // Try /ajax/chapters/ POST (simple, no body needed on some themes)
    let chapDoc = null;
    try {
        let chapUrl = url.replace(/\/?$/, '/') + 'ajax/chapters/';
        let res = Http.post(chapUrl)
            .header('User-Agent', 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36')
            .header('X-Requested-With', 'XMLHttpRequest')
            .header('Content-Type', 'application/x-www-form-urlencoded')
            .header('Referer', url)
            .execute();
        if (res && res.ok) chapDoc = res.html();
        if (chapDoc && !chapDoc.select('li.wp-manga-chapter, .wp-manga-chapter').first()) chapDoc = null;
    } catch(e) {}

    // Fallback: admin-ajax.php with post ID
    if (!chapDoc && postId) {
        try {
            let res2 = Http.post(BASE_URL + '/wp-admin/admin-ajax.php')
                .header('User-Agent', 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36')
                .header('X-Requested-With', 'XMLHttpRequest')
                .header('Content-Type', 'application/x-www-form-urlencoded')
                .header('Referer', url)
                .body('action=manga_get_chapters&manga=' + postId)
                .execute();
            if (res2 && res2.ok) chapDoc = res2.html();
        } catch(e) {}
    }

    if (!chapDoc) chapDoc = doc;

    chapDoc.select('li.wp-manga-chapter a, .wp-manga-chapter a').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let name = cleanText(e.text() || e.attr('title') || '');
        if (!name) name = 'Chapter';
        chapters.push({ name: name, url: link, host: BASE_URL });
    });

    chapters.reverse();
    if (chapters.length === 0) return Response.error("No chapters found.");
    return Response.success(chapters);
}
