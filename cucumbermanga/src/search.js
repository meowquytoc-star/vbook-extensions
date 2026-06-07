load('config.js');

function execute(keyword, page) {
    if (!keyword) return Response.error("No keyword.");
    let p = parseInt(page) || 1;
    let url = BASE_URL + '/?s=' + encodeURIComponent(keyword) + '&post_type=wp-manga';
    if (p > 1) url += '&paged=' + p;

    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot search.");

    let items = parseMadaraListing(doc);
    let token = nextPageUrl(doc) ? String(p + 1) : null;
    return Response.success(items, token);
}
