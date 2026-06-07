load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    doc.select('a.chapter-item, .chapter-list a, .list-chapter a').forEach(function (el) {
        let link = absUrl(el.attr('href') || '').replace(/[?#].*$/, '');
        if (!link || seen[link]) return;
        if (link.indexOf(BASE_URL) !== 0) return;
        seen[link] = true;
        let noEl = el.select('.chapter-no').first();
        let name = noEl ? ('Chương ' + cleanText(noEl.text())) : cleanText(el.text() || el.attr('title') || '');
        if (!name) name = 'Chapter';
        chapters.push({ name: name, url: link, host: BASE_URL });
    });

    chapters.reverse();

    if (chapters.length === 0) return Response.error("No chapters found.");
    return Response.success(chapters);
}
