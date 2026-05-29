load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};
    let storyBase = normalizeUrl(url).replace(/\/+$/, '');

    // Primary: use chapter list container and take ALL links inside it
    let listEl = doc.select('.list-chapter, #list-chapter, .chapter-list, ul.list_item_chapter, .list_item_chapter, [class*=chapter-list]').first();
    if (listEl) {
        listEl.select('a[href]').forEach(function(e) {
            let link = normalizeUrl(e.attr('href') || '');
            if (!link || seen[link]) return;
            if (link.indexOf(BASE_URL) !== 0) return;
            if (link === storyBase || link === storyBase + '/') return;
            seen[link] = true;
            let name = cleanText(e.text() || e.attr('title') || '');
            if (!name) name = 'Chapter';
            chapters.push({ name: name, url: link, host: BASE_URL });
        });
    }

    // Fallback: try multiple chapter URL patterns (including /tap- for Japanese doujins)
    if (chapters.length === 0) {
        ['/chap-', '/chapter-', '/tap-', '/chuong-'].forEach(function(pat) {
            doc.select('a[href*="' + pat + '"]').forEach(function(e) {
                let link = normalizeUrl(e.attr('href') || '').replace(/\?.*$/, '');
                if (!link || seen[link]) return;
                if (link.indexOf(BASE_URL) !== 0) return;
                seen[link] = true;
                let name = cleanText(e.text() || e.attr('title') || '');
                if (!name) name = 'Chapter';
                chapters.push({ name: name, url: link, host: BASE_URL });
            });
        });
    }

    chapters.reverse();
    return Response.success(chapters);
}
