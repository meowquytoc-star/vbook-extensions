load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let name = cleanText(doc.select('h1').first() ? doc.select('h1').first().text() : '');

    let cover = '';
    let imgEl = doc.select('img[src*="story_avatars"]').first();
    if (imgEl) cover = normalizeUrl(imgEl.attr('src') || '');
    if (!cover) {
        let og = doc.select('meta[property="og:image"]').first();
        if (og) cover = og.attr('content') || '';
    }

    let desc = '';
    let descEl = doc.select('.story-description, .summary, meta[name="description"]').first();
    if (descEl) desc = cleanText(descEl.tagName ? descEl.text() : descEl.attr('content') || '');

    return Response.success({ name: name, cover: cover, description: desc, link: url });
}
