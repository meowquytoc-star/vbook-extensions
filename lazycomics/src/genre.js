load('config.js');

const FALLBACK = [
    "boy-love", "yaoi", "shounen-ai", "yuri", "shoujo-ai",
    "nguoi-lon", "abo", "smut", "ngon-tinh",
    "manhwa", "manhua", "manga", "webtoon",
    "doujinshi", "one-shot", "tap-chi"
];

function titleize(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function execute() {
    let doc = getDoc(BASE_URL + '/');
    let data = [];
    let seen = {};

    if (doc) {
        doc.select('a[href*="/the-loai/"]').forEach(function (e) {
            let link = absUrl(e.attr('href') || '');
            if (!link || seen[link]) return;
            let name = cleanText(e.text().replace(/^»\s*/, ''));
            if (!name || name.length > 40) return;
            seen[link] = true;
            data.push({ title: name, input: link, script: 'gen.js' });
        });
    }

    if (data.length === 0) {
        FALLBACK.forEach(function (slug) {
            data.push({
                title: titleize(slug),
                input: BASE_URL + '/the-loai/' + slug,
                script: 'gen.js'
            });
        });
    }
    return Response.success(data);
}
