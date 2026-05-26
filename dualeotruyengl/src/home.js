load('config.js');

function execute(page) {
    let url = page > 1 ? BASE_URL + '/?page=' + page : BASE_URL + '/';
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load home page.");

    let items = parseListing(doc);
    if (items.length === 0) return Response.error("No stories found.");

    let hasMore = !!nextPageUrl(doc, url);
    return Response.success(items, hasMore);
}
