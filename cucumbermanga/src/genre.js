load('config.js');

const FALLBACK = [
    "yaoi", "boy-love", "bl", "shounen-ai", "smut",
    "manhwa", "manhua", "manga", "webtoon",
    "16", "18", "adult", "mature", "ngon-tinh",
    "comedy", "drama", "romance", "fantasy", "school-life",
    "office", "omegaverse", "abo"
];

function titleize(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function execute() {
    let doc = getDoc(BASE_URL + '/');
    let data = [];
    let seen = {};

    if (doc) {
        doc.select('a[href*="/manga-genre/"], a[href*="/genre/"]').forEach(function (e) {
            let link = absUrl(e.attr('href') || '');
            if (!link || seen[link]) return;
            if (link.replace(/\/+$/, '') === BASE_URL) return;
            let name = cleanText(e.text());
            if (!name || name.length > 40) return;
            seen[link] = true;
            data.push({ title: name, input: link, script: 'gen.js' });
        });
    }

    if (data.length === 0) {
        FALLBACK.forEach(function (slug) {
            data.push({
                title: titleize(slug),
                input: BASE_URL + '/manga-genre/' + slug + '/',
                script: 'gen.js'
            });
        });
    }
    return Response.success(data);
}
