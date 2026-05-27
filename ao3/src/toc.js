load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load work.");

    let chapters = [];

    // Multi-chapter: navigate work?view_full_work=true or parse chapter index
    let chapSelect = doc.select('#chapter_index select#jump option, #selected_id option');
    if (chapSelect && chapSelect.first()) {
        chapSelect.forEach(function(opt) {
            let val = cleanText(opt.attr('value') || '');
            let label = cleanText(opt.text());
            if (!val || !label) return;
            let chapUrl = '';
            if (/^https?:\/\//i.test(val)) {
                chapUrl = adultUrl(val);
            } else {
                let wMatch = ('' + url).match(/\/works\/(\d+)/);
                if (wMatch) {
                    chapUrl = adultUrl(BASE_URL + '/works/' + wMatch[1] + '/chapters/' + val);
                }
            }
            if (chapUrl) chapters.push({ name: label, url: chapUrl, host: BASE_URL });
        });
    }

    // Single-chapter work — just use the work URL itself
    if (chapters.length === 0) {
        let workTitle = cleanText(doc.select('h2.title.heading').first()
            ? doc.select('h2.title.heading').first().text() : 'Chapter 1');
        chapters.push({ name: workTitle || 'Chapter 1', url: adultUrl(url), host: BASE_URL });
    }

    return Response.success(chapters);
}
