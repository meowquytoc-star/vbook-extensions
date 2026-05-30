load('config.js');

function execute(query, page) {
    let pageUrl = listPageUrl(BASE_URL + '/tim-kiem?q=' + encodeURIComponent(query), page);
    let doc = getDoc(pageUrl);
    if (!doc) return Response.error("Cannot search.");
    let items = parseComicItems(doc);
    let currentPage = parseInt(page) || 1;
    let next = nextPage(doc, currentPage);
    return Response.success(items, next ? String(currentPage + 1) : null);
}
