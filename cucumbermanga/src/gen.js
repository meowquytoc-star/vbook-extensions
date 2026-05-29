load('config.js');

function execute(url, page) {
    let currentPage = parseInt(page) || 1;
    let pageUrl = currentPage > 1 ? url.replace(/\/?$/, '/') + 'page/' + currentPage + '/' : url;
    let doc = getDoc(pageUrl);
    if (!doc) return Response.error("Cannot load genre page.");

    let items = parseMadaraListing(doc);
    if (items.length === 0) return Response.error("No stories found.");

    let nextUrl = nextPageUrl(doc);
    return Response.success(items, nextUrl ? String(currentPage + 1) : null);
}
