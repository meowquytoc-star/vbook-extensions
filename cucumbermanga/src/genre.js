load('config.js');

function execute() {
    let doc = getDoc('https://cucumbermanga.com/');
    let data = [];
    let seen = {};

    if (doc) {
        doc.select('a[href*="/manga-genre/"], a[href*="/genre/"]').forEach(function(e) {
            let link = normalizeUrl(e.attr('href') || '');
            if (!link || seen[link] || link === 'https://cucumbermanga.com/') return;
            let name = cleanText(e.text());
            if (!name || name.length > 40) return;
            seen[link] = true;
            data.push({ title: name, input: link, script: 'gen.js' });
        });
    }

    if (data.length === 0) {
        data = [{ title: 'All Manga', input: 'https://cucumbermanga.com/manga-2/', script: 'gen.js' }];
    }
    return Response.success(data);
}
