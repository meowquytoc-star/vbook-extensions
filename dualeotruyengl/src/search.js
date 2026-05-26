load('config.js');

function execute(keyword, page) {
    let url = BASE_URL + '/?s=' + encodeURIComponent(keyword);
    if (page > 1) url += '&page=' + page;
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot search.");

    let items = parseListing(doc);
    let hasMore = !!nextPageUrl(doc, url);
    return Response.success(items, hasMore);
}
