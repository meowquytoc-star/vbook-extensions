load('config.js');

function execute() {
    let doc = getDoc(BASE_URL + '/');
    if (!doc) return Response.error("Cannot load genres.");

    let genres = [];
    let seen = {};
    doc.select('a[href*="/manga-genre/"], a[href*="/genre/"], .menu-item a[href*="cucumbermanga"]').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || seen[link] || link === BASE_URL + '/') return;
        let name = cleanText(e.text());
        if (!name || name.length > 40) return;
        seen[link] = true;
        genres.push({ name: name, link: link });
    });

    if (genres.length === 0) genres.push({ name: 'All Manga', link: BASE_URL + '/manga-2/' });
    return Response.success(genres);
}
