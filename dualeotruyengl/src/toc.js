load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    let storyBase = normalizeUrl(url).replace(/\/+$/, '');
    doc.select('a[href*="/chapter-"]').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || seen[link]) return;
        if (link.indexOf(storyBase + '/chapter-') === -1) return;
        seen[link] = true;
        let name = cleanText(e.text() || e.attr('title') || '');
        if (!name) name = 'Chapter';
        chapters.push({ name: name, url: link, host: BASE_URL });
    });

    chapters.reverse();
    return Response.success(chapters);
}
