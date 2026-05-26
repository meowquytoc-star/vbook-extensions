load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let name = cleanText(doc.select('h1.posttitle, h1').first()
        ? doc.select('h1.posttitle, h1').first().text() : '');
    if (!name) {
        let meta = doc.select('meta[property="og:title"]').first();
        if (meta) name = cleanText(meta.attr('content').split(' - ')[0]);
    }

    let cover = '';
    let og = doc.select('meta[property="og:image"]').first();
    if (og) cover = og.attr('content') || '';

    let desc = '';
    let descEl = doc.select('meta[name="description"]').first();
    if (descEl) desc = cleanText(descEl.attr('content') || '');

    return Response.success({ name: name, cover: cover, description: desc, link: url });
}
