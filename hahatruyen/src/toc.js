load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    // Story page itself is chapter 1
    let storyUrl = normalizeUrl(url);
    seen[storyUrl] = true;
    chapters.push({ name: 'Chương 1', url: storyUrl, host: BASE_URL });

    doc.select('a[href*="truyen-full-chapter"]').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || seen[link]) return;
        let name = cleanText(e.text() || e.attr('title') || '');
        if (!name) name = 'Chương';
        seen[link] = true;
        chapters.push({ name: name, url: link, host: BASE_URL });
    });

    return Response.success(chapters);
}
