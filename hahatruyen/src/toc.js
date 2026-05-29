load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    // Try multiple chapter URL patterns used by hahatruyen.com.vn
    ['truyen-full-chapter', 'chapter-', 'chuong-'].forEach(function(pat) {
        doc.select('a[href*="' + pat + '"]').forEach(function(e) {
            let link = normalizeUrl(e.attr('href') || '');
            if (!link || seen[link]) return;
            if (link.indexOf(BASE_URL) !== 0) return;
            let name = cleanText(e.text() || e.attr('title') || '');
            if (!name) name = 'Chương';
            seen[link] = true;
            chapters.push({ name: name, url: link, host: BASE_URL });
        });
    });

    // Sort by chapter number ascending
    chapters.sort(function(a, b) {
        let na = parseInt((a.url.match(/(?:chapter|chuong)-(\d+)/i) || [0, 0])[1]) || 0;
        let nb = parseInt((b.url.match(/(?:chapter|chuong)-(\d+)/i) || [0, 0])[1]) || 0;
        return na - nb;
    });

    // If no chapters found, the story URL itself is the single chapter
    if (chapters.length === 0) {
        let storyUrl = normalizeUrl(url);
        let title = cleanText(doc.select('h1').first() ? doc.select('h1').first().text() : 'Chương 1');
        chapters.push({ name: title || 'Chương 1', url: storyUrl, host: BASE_URL });
    }

    return Response.success(chapters);
}
