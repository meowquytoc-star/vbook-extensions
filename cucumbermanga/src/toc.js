load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    // Madara theme loads chapters via AJAX POST, not in static HTML
    let chapDoc = null;
    try {
        let chapUrl = url.replace(/\/?$/, '/') + 'ajax/chapters/';
        let res = Http.post(chapUrl)
            .header('User-Agent', 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36')
            .header('X-Requested-With', 'XMLHttpRequest')
            .header('Referer', url)
            .execute();
        if (res && res.ok) chapDoc = res.html();
    } catch(e) {}

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
