load('config.js');

function execute() {
    let doc = getDoc(BASE_URL);
    if (!doc) return Response.success([
        { name: "Boy Love", link: BASE_URL + '/the-loai/boy-love', cover: '' },
        { name: "Yaoi", link: BASE_URL + '/the-loai/yaoi', cover: '' },
        { name: "Người Lớn (18+)", link: BASE_URL + '/the-loai/nguoi-lon', cover: '' }
    ]);

    let data = [];
    let seen = {};
    doc.select('a[href*="/the-loai/"]').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || seen[link]) return;
        let name = cleanText(e.text().replace(/^»\s*/, ''));
        if (!name) return;
        seen[link] = true;
        data.push({ name: name, link: link, cover: '' });
    });

    if (data.length === 0) return Response.success([
        { name: "Boy Love", link: BASE_URL + '/the-loai/boy-love', cover: '' },
        { name: "Yaoi", link: BASE_URL + '/the-loai/yaoi', cover: '' }
    ]);
    return Response.success(data);
}
