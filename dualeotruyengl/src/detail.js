load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let name = cleanText(doc.select('h1').first() ? doc.select('h1').first().text() : '');

    let cover = '';
    let imgEl = doc.select('img[data-src*="imgdualeo"], img[src*="imgdualeo"]').first();
    if (!imgEl) imgEl = doc.select('.thumbnail img, .cover img, .info-thumbnail img').first();
    if (imgEl) {
        cover = imgEl.attr('data-src') || imgEl.attr('src') || '';
        if (cover.startsWith('//')) cover = 'https:' + cover;
    }
    if (!cover) {
        let og = doc.select('meta[property="og:image"]').first();
        if (og) cover = og.attr('content') || '';
    }

    let desc = '';
    let descEl = doc.select('.summary-content, .description-summary, meta[name="description"]').first();
    if (descEl) {
        let tag = descEl.attr('content');
        desc = tag ? cleanText(tag) : cleanText(descEl.text());
    }

    return Response.success({ name: name, cover: cover, description: desc, host: BASE_URL });
}
