load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load work.");

    let chapters = [];

    // Multi-chapter: navigate work?view_full_work=true or parse chapter index
    let chapSelect = doc.select('#chapter_index select#jump option, #selected_id option');
    if (chapSelect && chapSelect.size() > 0) {
        chapSelect.forEach(function(opt) {
            let val = cleanText(opt.attr('value') || '');
            let label = cleanText(opt.text());
            if (!val || !label) return;
            let chapUrl = '';
            // value may be full URL or chapter id
            if (/^https?:\/\//i.test(val)) {
                chapUrl = adultUrl(val);
            } else {
                // Extract work id from url
                let wMatch = ('' + url).match(/\/works\/(\d+)/);
                if (wMatch) {
                    chapUrl = adultUrl(BASE_URL + '/works/' + wMatch[1] + '/chapters/' + val);
                }
            }
            if (chapUrl) chapters.push({ name: label, link: chapUrl });
        });
    }

    // Single-chapter work — just use the work URL itself
    if (chapters.length === 0) {
        let workTitle = cleanText(doc.select('h2.title.heading').first()
            ? doc.select('h2.title.heading').first().text() : 'Chapter 1');
        chapters.push({ name: workTitle || 'Chapter 1', link: adultUrl(url) });
    }

    return Response.success(chapters);
}
