load('config.js');

function pickMeta(doc, key) {
    let el = doc.select('meta[property="' + key + '"], meta[name="' + key + '"]').first();
    return el ? cleanText(el.attr('content') || '') : '';
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let titleEl = doc.select('h1.posttitle, h1.entry-title, h1').first();
    let name = cleanText(titleEl ? titleEl.text() : '');
    if (!name) {
        let og = pickMeta(doc, 'og:title');
        if (og) name = cleanText(og.split(' - ')[0]);
    }

    let cover = pickMeta(doc, 'og:image');
    if (!cover) {
        let img = doc.select('.posttitle img, article img, .entry-content img').first();
        if (img) cover = absUrl(imgSrc(img));
    }

    let desc = '';
    let descEl = doc.select('.story-summary, .entry-content p, .desc-text').first();
    if (descEl) desc = cleanText(descEl.text());
    if (!desc) desc = pickMeta(doc, 'og:description') || pickMeta(doc, 'description');

    return Response.success({
        name: name,
        cover: cover,
        description: desc,
        host: BASE_URL
    });
}
