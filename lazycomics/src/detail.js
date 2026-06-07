load('config.js');

function pickMeta(doc, key) {
    let el = doc.select('meta[property="' + key + '"], meta[name="' + key + '"]').first();
    return el ? cleanText(el.attr('content') || '') : '';
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let titleEl = doc.select('h1.manga-title, h1.comic-title, h1').first();
    let name = cleanText(titleEl ? titleEl.text() : pickMeta(doc, 'og:title'));

    let cover = '';
    let imgEl = doc.select('.manga-cover img.cover-image, .manga-cover img, .comic-cover img, img[src*="story_avatars"]').first();
    if (imgEl) cover = coverUrl(imgSrc(imgEl));
    if (!cover) cover = pickMeta(doc, 'og:image');

    let desc = '';
    let descEl = doc.select('.story-description, .manga-description, .comic-description, .description, .summary').first();
    if (descEl) desc = cleanText(descEl.text());
    if (!desc) desc = pickMeta(doc, 'og:description') || pickMeta(doc, 'description');

    let author = '';
    doc.select('.manga-info li, .comic-info li, .info-item, .meta-item').forEach(function (li) {
        let t = cleanText(li.text());
        if (/^(Tác giả|Author)\s*:/i.test(t)) {
            author = cleanText(t.replace(/^[^:]+:\s*/, ''));
        }
    });

    return Response.success({
        name: name,
        cover: cover,
        description: desc,
        author: author,
        host: BASE_URL
    });
}
