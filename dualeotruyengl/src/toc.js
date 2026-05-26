load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    doc.select('.list-chapters a, .chapter-list a, ul.row-content-chapter a').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let name = cleanText(e.text() || e.attr('title') || '');
        if (!name) name = 'Chapter';
        chapters.push({ name: name, link: link });
    });

    chapters.reverse();
    return Response.success(chapters);
}
