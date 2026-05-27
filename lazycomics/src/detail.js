load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let name = cleanText(doc.select('h1.manga-title, h1').first()
        ? doc.select('h1.manga-title, h1').first().text() : '');

    let cover = '';
    let imgEl = doc.select('.manga-cover img.cover-image, img[src*="story_avatars"]').first();
    if (imgEl) cover = coverUrl(imgEl.attr('src') || imgEl.attr('data-src') || '');
    if (!cover) {
        let og = doc.select('meta[property="og:image"]').first();
        if (og) cover = og.attr('content') || '';
    }

    let desc = '';
    let descEl = doc.select('meta[name="description"]').first();
    if (descEl) desc = cleanText(descEl.attr('content') || '');
    if (!desc) {
        let bodyEl = doc.select('.story-description, .manga-description, .description').first();
        if (bodyEl) desc = cleanText(bodyEl.text());
    }

    return Response.success({ name: name, cover: cover, description: desc, link: url });
}
