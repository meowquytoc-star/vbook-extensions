load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    function parseChapters(d) {
        ['truyen-full-chapter', 'chapter-', 'chuong-'].forEach(function(pat) {
            d.select('a[href*="' + pat + '"]').forEach(function(e) {
                let link = normalizeUrl(e.attr('href') || '');
                if (!link || seen[link]) return;
                if (link.indexOf(BASE_URL) !== 0) return;
                let name = cleanText(e.text() || e.attr('title') || '');
                if (!name) name = 'Chương';
                seen[link] = true;
                chapters.push({ name: name, url: link, host: BASE_URL });
            });
        });
    }

    parseChapters(doc);

    // Site only shows latest chapters by default — try fetching full chapter list via pagination
    // Look for pagination within chapter list section
    let chapSection = doc.select('.list-chapter, #list-chapter, .chapter-list, .list_chapter').first();
    if (chapSection) {
        let pageLinks = chapSection.select('a[href*="?page="], a.next, a[rel=next]');
        let nextPageEl = pageLinks.first();
        let visited = {};
        visited[normalizeUrl(url)] = true;
        let maxPages = 20;
        while (nextPageEl && maxPages-- > 0) {
            let nextUrl = normalizeUrl(nextPageEl.attr('href') || '');
            if (!nextUrl || visited[nextUrl]) break;
            visited[nextUrl] = true;
            let nextDoc = getDoc(nextUrl);
            if (!nextDoc) break;
            parseChapters(nextDoc);
            let nextSec = nextDoc.select('.list-chapter, #list-chapter, .chapter-list, .list_chapter').first();
            nextPageEl = nextSec ? nextSec.select('a[href*="?page="], a.next, a[rel=next]').first() : null;
        }
    }

    // Sort by chapter number ascending
    chapters.sort(function(a, b) {
        let na = parseInt((a.url.match(/(?:chapter|chuong|truyen-full-chapter)-(\d+)/i) || [0, 0])[1]) || 0;
        let nb = parseInt((b.url.match(/(?:chapter|chuong|truyen-full-chapter)-(\d+)/i) || [0, 0])[1]) || 0;
        return na - nb;
    });

    // If no chapters found at all, fall back to story URL as single chapter
    if (chapters.length === 0) {
        let title = cleanText(doc.select('h1').first() ? doc.select('h1').first().text() : 'Chương 1');
        chapters.push({ name: title || 'Chương 1', url: normalizeUrl(url), host: BASE_URL });
    }

    return Response.success(chapters);
}
