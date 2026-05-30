load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let name = cleanText(doc.select('h1.manga-title').first() ? doc.select('h1.manga-title').first().text() : '');
    if (!name) return Response.error("Cannot parse story info.");

    let imgEl = doc.select('.manga-cover img').first();
    let cover = imgEl ? normalizeUrl(imgEl.attr('src') || '') : '';

    let descEl = doc.select('.manga-description p').first();
    let desc = descEl ? cleanText(descEl.text()) : '';

    let tags = [];
    doc.select('.manga-tags a.tag').forEach(function(t) { tags.push(cleanText(t.text())); });
    if (tags.length > 0 && desc) desc = tags.join(', ') + '\n' + desc;
    else if (tags.length > 0) desc = tags.join(', ');

    return Response.success({ name: name, cover: cover, description: desc, host: BASE_URL });
}
