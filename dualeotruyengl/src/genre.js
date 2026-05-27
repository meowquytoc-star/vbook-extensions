load('config.js');

function execute() {
    let doc = getDoc(BASE_URL + '/');
    let data = [];
    let seen = {};

    if (doc) {
        doc.select('nav a[href*="/the-loai/"], .menu a[href*="/the-loai/"]').forEach(function(e) {
            let link = normalizeUrl(e.attr('href') || '');
            if (!link || seen[link]) return;
            seen[link] = true;
            let name = cleanText(e.text());
            if (name) data.push({ title: name, input: link, script: 'gen.js' });
        });
    }

    if (data.length === 0) {
        data = [{ title: 'Tất cả', input: BASE_URL + '/', script: 'gen.js' }];
    }
    return Response.success(data);
}
