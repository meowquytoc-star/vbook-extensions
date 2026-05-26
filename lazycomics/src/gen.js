load('config.js');

function execute(url, page) {
    let pageUrl = listPageUrl(url, page);
    let doc = getDoc(pageUrl);
    if (!doc) return Response.error("Cannot load page.");

    let data = parseComicItems(doc);
    if (data.length === 0) return Response.error("No stories found.");

    let hasMore = !!nextPage(doc, page);
    return Response.success(data, hasMore);
}
