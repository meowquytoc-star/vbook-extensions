load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let name = cleanText(doc.select('.post-title h1, h1').first() ? doc.select('.post-title h1, h1').first().text() : '');

    let cover = '';
    let imgEl = doc.select('.summary_image img, .tab-summary img').first();
    if (imgEl) cover = imgEl.attr('data-src') || imgEl.attr('src') || '';
    if (!cover) {
        let og = doc.select('meta[property="og:image"]').first();
        if (og) cover = og.attr('content') || '';
    }
    if (cover.startsWith('//')) cover = 'https:' + cover;

    let desc = '';
    let descEl = doc.select('.summary__content, .manga-excerpt, meta[name="description"]').first();
    if (descEl) {
        let content = descEl.attr('content');
        desc = content ? cleanText(content) : cleanText(descEl.text());
    }

    return Response.success({ name: name, cover: cover, description: desc, host: BASE_URL });
}
