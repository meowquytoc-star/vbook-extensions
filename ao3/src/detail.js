load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load work page.");

    // Title
    let name = cleanText(doc.select('h2.title.heading, .work h2.title').first()
        ? doc.select('h2.title.heading, .work h2.title').first().text() : '');
    if (!name) name = cleanText(doc.select('title').first()
        ? doc.select('title').first().text().split('|')[0] : '');

    // Author
    let authorEl = doc.select('a[rel=author]').first();
    let author = authorEl ? cleanText(authorEl.text()) : '';

    // Cover — AO3 has no cover images; use empty string
    let cover = '';

    // Summary
    let summaryEl = doc.select('.summary blockquote, .summary .userstuff').first();
    let description = summaryEl ? cleanText(summaryEl.text()) : '';

    // Tags: fandom, characters, relationships, additional tags
    let tags = [];
    doc.select('.work.meta .tags a, dd.fandom.tags a, dd.relationship.tags a, dd.character.tags a, dd.freeform.tags a').forEach(function(e) {
        let t = cleanText(e.text());
        if (t) tags.push(t);
    });

    // Stats
    let statsEl = doc.select('dd.stats dl.stats').first();
    let stats = statsEl ? cleanText(statsEl.text()) : '';
    if (stats) description = description ? description + '\n\n' + stats : stats;

    return Response.success({
        name: name,
        cover: cover,
        description: description,
        author: author,
        tags: tags,
        host: BASE_URL
    });
}
