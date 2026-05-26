load('config.js');

function execute() {
    let doc = getDoc(BASE_URL + '/');
    if (!doc) return Response.error("Cannot load genres.");

    let genres = [];
    let seen = {};
    doc.select('nav a[href*="/the-loai/"], .menu a[href*="/the-loai/"]').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || seen[link]) return;
        seen[link] = true;
        let name = cleanText(e.text());
        if (name) genres.push({ name: name, link: link });
    });

    if (genres.length === 0) genres.push({ name: 'Tất cả', link: BASE_URL + '/' });
    return Response.success(genres);
}
