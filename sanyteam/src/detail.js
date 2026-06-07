load('config.js');

function pickMeta(doc, key) {
    let el = doc.select('meta[property="' + key + '"], meta[name="' + key + '"]').first();
    return el ? cleanText(el.attr('content') || '') : '';
}

function fieldByLabel(doc, labelRe) {
    let val = '';
    doc.select('.manga-info-item, .manga-meta li, .info-row, .meta-item').forEach(function (row) {
        let t = cleanText(row.text());
        let m = t.match(/^([^:]+):\s*(.+)$/);
        if (m && labelRe.test(m[1])) val = cleanText(m[2]);
    });
    return val;
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let titleEl = doc.select('h1.manga-title, h1').first();
    let name = cleanText(titleEl ? titleEl.text() : pickMeta(doc, 'og:title'));
    if (!name) return Response.error("Cannot parse story info.");

    let cover = absUrl(imgSrc(doc.select('.manga-cover img').first()));
    if (!cover) cover = pickMeta(doc, 'og:image');

    let descEl = doc.select('.manga-description, .manga-description p, .description, .summary').first();
    let desc = descEl ? cleanText(descEl.text()) : '';
    if (!desc) desc = pickMeta(doc, 'og:description') || pickMeta(doc, 'description');

    let tags = [];
    doc.select('.manga-tags a.tag, .manga-genres a, .tags a').forEach(function (t) {
        let v = cleanText(t.text());
        if (v) tags.push(v);
    });

    let author = fieldByLabel(doc, /^(Tác giả|Author|Hoạ sĩ|Artist)/i);
    let status = fieldByLabel(doc, /^(Tình trạng|Status|Trạng thái)/i);

    let composed = desc;
    if (tags.length > 0) composed = tags.join(', ') + (desc ? ('\n' + desc) : '');

    return Response.success({
        name: name,
        cover: cover,
        description: composed,
        author: author,
        status: status,
        genre: tags.join(', '),
        host: BASE_URL
    });
}
