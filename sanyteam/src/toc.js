load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    doc.select('a.chapter-item').forEach(function(el) {
        let link = normalizeUrl(el.attr('href') || '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let noEl = el.select('.chapter-no').first();
        let name = noEl ? ('Chương ' + cleanText(noEl.text())) : cleanText(el.text());
        if (!name) name = 'Chapter';
        chapters.push({ name: name, url: link, host: BASE_URL });
    });

    // Site lists chapters newest-first; reverse to ascending order
    chapters.reverse();

    if (chapters.length === 0) return Response.error("No chapters found.");
    return Response.success(chapters);
}
