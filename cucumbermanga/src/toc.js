load('config.js');

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

function fetchChapterDoc(url) {
    try {
        let chapUrl = url.replace(/\/?$/, '/') + 'ajax/chapters/';
        let res = Http.post(chapUrl)
            .header('User-Agent', UA)
            .header('X-Requested-With', 'XMLHttpRequest')
            .header('Content-Type', 'application/x-www-form-urlencoded')
            .header('Referer', url)
            .execute();
        if (res && res.ok) {
            let d = res.html();
            if (d && d.select('li.wp-manga-chapter a, .wp-manga-chapter a').first()) return d;
        }
    } catch (e) {}
    return null;
}

function fetchChapterDocByPostId(url, postId) {
    if (!postId) return null;
    try {
        let res = Http.post(BASE_URL + '/wp-admin/admin-ajax.php')
            .header('User-Agent', UA)
            .header('X-Requested-With', 'XMLHttpRequest')
            .header('Content-Type', 'application/x-www-form-urlencoded')
            .header('Referer', url)
            .body('action=manga_get_chapters&manga=' + postId)
            .execute();
        if (res && res.ok) return res.html();
    } catch (e) {}
    return null;
}

function collect(scope, chapters, seen) {
    scope.select('li.wp-manga-chapter a, .wp-manga-chapter a, .listing-chapters_wrap a').forEach(function (e) {
        let link = absUrl(e.attr('href') || '').replace(/[?#].*$/, '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let name = cleanText(e.text() || e.attr('title') || '') || 'Chapter';
        chapters.push({ name: name, url: link, host: BASE_URL });
    });
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
