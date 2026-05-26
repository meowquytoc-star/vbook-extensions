load('config.js');

function execute(url, page) {
    let doc = getDoc(listPageUrl(url, page));
    if (!doc) return Response.error("Cannot load page.");

    let data = [];
    let seen = {};
    doc.select('a[href*="/truyen/"]').forEach(function(e) {
        let link = normalizeUrl(e.attr('href') || '');
        if (!link || link === BASE_URL + '/truyen' || seen[link]) return;
        if (!/\/truyen\/[^\/]+$/.test(link)) return;
        let imgEl = e.select('img[src*="story_avatars"]').first();
        if (!imgEl) return;
        let cover = coverUrl(imgEl.attr('src') || '');
        let nameEl = e.select('h3, .story-title, .title').first();
        let name = cleanText(nameEl ? nameEl.text() : e.attr('title') || '');
        if (!name) return;
        seen[link] = true;
        data.push({ name: name, link: link, cover: cover, description: '', host: BASE_URL });
    });

    return Response.success(data, nextPage(doc));
}
