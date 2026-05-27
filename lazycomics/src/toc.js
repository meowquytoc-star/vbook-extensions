load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};
    doc.select('a.chapter-item').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || seen[link]) return;
        let titleEl = e.select('h3').first();
        let name = cleanText(titleEl ? titleEl.text() : e.text());
        if (!name) name = 'Chapter';
        seen[link] = true;
        chapters.push({ name: name, url: link, host: BASE_URL });
    });

    chapters.reverse();
    return Response.success(chapters);
}
