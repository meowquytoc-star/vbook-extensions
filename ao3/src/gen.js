load('config.js');

function execute(url, page) {
    let pageUrl = listPageUrl(url, page);
    let doc = getDoc(pageUrl);
    if (!doc) return Response.error("Cannot load page.");

    let data = [];
    let seen = {};

    doc.select('li.work, ol.work-listing > li').forEach(function(e) {
        let item = workItem(e);
        if (item && !seen[item.link]) {
            seen[item.link] = true;
            data.push(item);
        }
    });

    if (data.length === 0 && isFandomListPage(url)) {
        doc.select('.index a[href*="/tags/"]').forEach(function(e) {
            let href = e.attr('href') || '';
            if (href.indexOf('/tags/') === -1) return;
            let link = normalizeUrl(href);
            if (link.indexOf('/works') === -1) link = link + '/works';
            link = adultUrl(link);
            if (seen[link]) return;
            seen[link] = true;
            let name = cleanText(e.text());
            if (name && data.length < 100) data.push({ name: name, link: link, cover: '' });
        });
    }

    return Response.success(data, nextPage(doc));
}
