load('config.js');

function execute() {
    let doc = getDoc('https://lazycomics.net/');
    let data = [];
    let seen = {};

    if (doc) {
        doc.select('a[href*="/the-loai/"]').forEach(function(e) {
            let link = normalizeUrl(e.attr('href') || '');
            if (!link || seen[link]) return;
            let name = cleanText(e.text().replace(/^»\s*/, ''));
            if (!name) return;
            seen[link] = true;
            data.push({ title: name, input: link, script: 'gen.js' });
        });
    }

    if (data.length === 0) {
        data = [
            { title: "Boy Love",        input: "https://lazycomics.net/the-loai/boy-love",   script: 'gen.js' },
            { title: "Yaoi",            input: "https://lazycomics.net/the-loai/yaoi",       script: 'gen.js' },
            { title: "Người Lớn (18+)", input: "https://lazycomics.net/the-loai/nguoi-lon",  script: 'gen.js' },
            { title: "ABO",             input: "https://lazycomics.net/the-loai/abo",        script: 'gen.js' },
            { title: "Manhwa",          input: "https://lazycomics.net/the-loai/manhwa",     script: 'gen.js' },
            { title: "Manga",           input: "https://lazycomics.net/the-loai/manga",      script: 'gen.js' },
            { title: "Webtoon",         input: "https://lazycomics.net/the-loai/webtoon",    script: 'gen.js' }
        ];
    }
    return Response.success(data);
}
