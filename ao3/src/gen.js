load('config.js');

function isFandomListPage(url) {
    return /\/fandoms(\/|$|\?)/.test(url) || /\/media\//.test(url);
}

function collectFandoms(doc) {
    let data = [];
    let seen = {};

    // Fandom listing pages — grouped by letter
    doc.select('li.fandom a, .fandoms li a, .index a[href*="/tags/"]').forEach(function(e) {
        let href = e.attr('href') || '';
        if (href.indexOf('/tags/') === -1) return;
        let link = normalizeUrl(href);
        // Convert tag page to works listing
        if (link.indexOf('/works') === -1) {
            link = link.replace('/tags/', '/tags/') + '/works';
        }
        if (seen[link]) return;
        let name = cleanText(e.text());
        if (!name) return;
        seen[link] = true;
        data.push({ name: name, link: adultUrl(link), cover: '', description: '', host: BASE_URL });
    });

    return data;
}

function collectWorks(doc) {
    let data = [];
    let seen = {};

    doc.select('li.work, article.work, ol.work-listing > li').forEach(function(e) {
        let item = workItem(e);
        if (item && !seen[item.link]) {
            seen[item.link] = true;
            data.push(item);
        }
    });

    return data;
}

function execute(url, page) {
    let pageUrl = listPageUrl(url, page);
    let doc = getDoc(pageUrl);
    if (!doc) return Response.error("Cannot load page.");

    let data;
    if (isFandomListPage(url)) {
        data = collectFandoms(doc);
    } else {
        data = collectWorks(doc);
    }

    return Response.success(data, nextPage(doc));
}
