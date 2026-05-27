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

    return Response.success(data, nextPage(doc));
}
