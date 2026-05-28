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
        chapters.push({ name: name, url: link, host: BASE_URL });
    });

    // Sort by chapter number ascending
    chapters.sort(function(a, b) {
        let na = parseInt((a.url.match(/chapter-(\d+)/) || [0, 0])[1]) || 0;
        let nb = parseInt((b.url.match(/chapter-(\d+)/) || [0, 0])[1]) || 0;
        return na - nb;
    });

    // Story URL itself is chapter 1 (no truyen-full-chapter-1 link exists)
    let storyUrl = normalizeUrl(url);
    if (!seen[storyUrl]) {
        chapters.unshift({ name: 'Chương 1', url: storyUrl, host: BASE_URL });
    }

    if (chapters.length === 0) return Response.error("No chapters found.");
    return Response.success(chapters);
}
