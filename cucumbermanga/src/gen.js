load('config.js');

function execute(url, page) {
    let pageUrl = page > 1 ? url.replace(/\/?$/, '/') + 'page/' + page + '/' : url;
    let doc = getDoc(pageUrl);
    if (!doc) return Response.error("Cannot load genre page.");

    let items = parseMadaraListing(doc);
    if (items.length === 0) return Response.error("No stories found.");

    let nextUrl = nextPageUrl(doc);
    let currentPage = parseInt(page) || 1;
    return Response.success(items, nextUrl ? String(currentPage + 1) : null);
}
