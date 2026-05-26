load('config.js');

function execute(keyword, page) {
    let url = BASE_URL + '/?s=' + encodeURIComponent(keyword) + '&post_type=wp-manga';
    if (page > 1) url += '&paged=' + page;
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot search.");

    let items = parseMadaraListing(doc);
    let hasMore = !!nextPageUrl(doc);
    return Response.success(items, hasMore);
}
