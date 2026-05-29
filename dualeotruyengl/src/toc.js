load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};
    let storyBase = normalizeUrl(url).replace(/\/+$/, '').replace(/\?.*$/, '');

    // Look in chapter list containers first, then fall back to full page
    let containers = doc.select('.list-chapter, #list-chapter, .chapter-list, ul.row-content-chapter, .list_item_chapter');
    let searchDoc = (containers && containers.first()) ? containers : doc;

    // Try multiple chapter URL patterns
    ['/chapter-', '/chap-', '/chuong-'].forEach(function(pat) {
        searchDoc.select('a[href*="' + pat + '"]').forEach(function(e) {
            let link = normalizeUrl(e.attr('href') || '').replace(/\?.*$/, '');
            if (!link || seen[link]) return;
            if (link.indexOf(BASE_URL) !== 0) return;
            seen[link] = true;
            let name = cleanText(e.text() || e.attr('title') || '');
            if (!name) name = 'Chapter';
            chapters.push({ name: name, url: link, host: BASE_URL });
        });
    });

    chapters.reverse();
    return Response.success(chapters);
}
