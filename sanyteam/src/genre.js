load('config.js');

const FALLBACK = [
    "boylove", "yaoi", "shounen-ai", "yuri",
    "manhwa", "manhua", "manga", "webtoon",
    "18", "smut", "abo", "omegaverse",
    "comedy", "drama", "romance", "fantasy"
];

function titleize(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function execute() {
    let doc = getDoc(BASE_URL + '/');
    let data = [];
    let seen = {};

    if (doc) {
        doc.select('a[href*="/the-loai/"]').forEach(function (el) {
            let link = absUrl(el.attr('href') || '');
            if (!link || seen[link]) return;
            let name = cleanText(el.text());
            if (!name || name.length < 2 || name.length > 40) return;
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
