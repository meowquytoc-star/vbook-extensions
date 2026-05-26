load('config.js');

function execute(url, page) {
    let pageUrl = page > 1 ? url + (url.indexOf('?') >= 0 ? '&' : '?') + 'page=' + page : url;
    let doc = getDoc(pageUrl);
    if (!doc) return Response.error("Cannot load genre page.");

    let items = parseListing(doc);
    if (items.length === 0) return Response.error("No stories found.");

    let hasMore = !!nextPageUrl(doc, pageUrl);
    return Response.success(items, hasMore);
}
