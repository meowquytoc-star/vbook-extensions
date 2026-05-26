load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};
    doc.select('a[href*="truyen-full-chapter"]').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || seen[link]) return;
        let name = cleanText(e.text() || e.attr('title') || '');
        if (!name) name = 'Chương';
        seen[link] = true;
        chapters.push({ name: name, link: link });
    });

    chapters.reverse();
    return Response.success(chapters);
}
