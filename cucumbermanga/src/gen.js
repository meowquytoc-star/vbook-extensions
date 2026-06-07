load('config.js');

function execute(url, page) {
    let p = parseInt(page) || 1;
    let doc = getDoc(listingPageUrl(url, p));
    if (!doc) return Response.error("Cannot load page.");

    let items = parseMadaraListing(doc);
    if (items.length === 0) return Response.error("No stories found.");

    let token = nextPageUrl(doc) ? String(p + 1) : null;
    return Response.success(items, token);
}
