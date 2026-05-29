load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let storyBase = normalizeUrl(url).replace(/\/+$/, '');
    let seen = {};
    let maxChap = 0;
    let chapMap = {};

    // Collect visible chapter links and detect max chapter number + name
    doc.select('a[href*="truyen-full-chapter"]').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || link.indexOf(storyBase) !== 0) return;
        let m = link.match(/truyen-full-chapter-(\d+)/);
        if (!m) return;
        let n = parseInt(m[1]);
        if (n > maxChap) maxChap = n;
        if (!chapMap[n]) {
            let name = cleanText(e.text() || e.attr('title') || '');
            chapMap[n] = name || ('Chương ' + n);
        }
    });

    // Also try other chapter patterns as fallback
    if (maxChap === 0) {
        ['chapter-', 'chuong-'].forEach(function(pat) {
            doc.select('a[href*="' + pat + '"]').forEach(function(e) {
                let link = normalizeUrl(e.attr('href') || '');
                if (!link || link.indexOf(storyBase) !== 0) return;
                let m = link.match(/(?:chapter|chuong)-(\d+)/i);
                if (!m) return;
                let n = parseInt(m[1]);
                if (n > maxChap) maxChap = n;
                if (!chapMap[n]) chapMap[n] = cleanText(e.text() || e.attr('title') || '') || ('Chương ' + n);
            });
        });
    }

    // Try to extract total chapter count from page text (e.g. "107 chương", "Chương 107")
    let pageText = cleanText(doc.select('body').first() ? doc.select('body').first().text() : '');
    let totalM = pageText.match(/(\d{2,4})\s*(?:chương|chuong|chapter)/i);
    if (totalM && parseInt(totalM[1]) > maxChap) maxChap = parseInt(totalM[1]);

    // If no chapters found at all, fall back to story URL as single chapter
    if (maxChap === 0) {
        let title = cleanText(doc.select('h1').first() ? doc.select('h1').first().text() : 'Chương 1');
        return Response.success([{ name: title || 'Chương 1', url: storyBase + '/', host: BASE_URL }]);
    }

    // Generate full chapter list from 1 to maxChap — no extra HTTP requests needed
    let chapters = [];
    for (let i = 1; i <= maxChap; i++) {
        let chapUrl = storyBase + '/truyen-full-chapter-' + i + '/';
        chapters.push({ name: chapMap[i] || ('Chương ' + i), url: chapUrl, host: BASE_URL });
    }

    return Response.success(chapters);
}
