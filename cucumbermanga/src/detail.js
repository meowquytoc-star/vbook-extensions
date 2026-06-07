load('config.js');

function pickMeta(doc, key) {
    let el = doc.select('meta[property="' + key + '"], meta[name="' + key + '"]').first();
    return el ? cleanText(el.attr('content') || '') : '';
}

function fieldValue(doc, labelRe) {
    let val = '';
    doc.select('.post-content_item, .summary-content, .manga-info li').forEach(function (row) {
        let h = row.select('.summary-heading, .label, h5').first();
        if (!h) return;
        if (labelRe.test(cleanText(h.text()))) {
            let v = row.select('.summary-content, .value').first();
            if (v) val = cleanText(v.text());
        }
    });
    return val;
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let titleEl = doc.select('.post-title h1, h1.entry-title, h1').first();
    let name = cleanText(titleEl ? titleEl.text() : pickMeta(doc, 'og:title'));

    let cover = imgSrc(doc.select('.summary_image img, .tab-summary img').first());
    if (!cover) cover = pickMeta(doc, 'og:image');

    let desc = '';
    let descEl = doc.select('.summary__content, .manga-excerpt, .description-summary').first();
    if (descEl) desc = cleanText(descEl.text());
    if (!desc) desc = pickMeta(doc, 'og:description') || pickMeta(doc, 'description');

    let author = fieldValue(doc, /^(Tác giả|Author|Artist|Hoạ sĩ)/i);
    let status = fieldValue(doc, /^(Tình trạng|Status)/i);

    let genres = [];
    doc.select('.genres-content a, .wp-manga-tags-list a').forEach(function (a) {
        let t = cleanText(a.text());
        if (t) genres.push(t);
    });

    return Response.success({
        name: name,
        cover: cover,
        description: desc,
        author: author,
        status: status,
        genre: genres.join(', '),
        host: BASE_URL
    });
}
