load('config.js');

function execute(page) {
    let url = page > 1 ? BASE_URL + '/manga-2/page/' + page + '/' : BASE_URL + '/manga-2/';
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load home page.");

    let items = parseMadaraListing(doc);
    if (items.length === 0) return Response.error("No stories found.");

    let hasMore = !!nextPageUrl(doc);
    return Response.success(items, hasMore);
}
