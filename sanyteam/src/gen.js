load('config.js');

function execute(url, page) {
    let pageUrl = listPageUrl(url, page);
    let doc = getDoc(pageUrl);
    if (!doc) return Response.error("Cannot load page.");
    let items = parseComicItems(doc);
    if (items.length === 0) return Response.error("No stories found.");
    let currentPage = parseInt(page) || 1;
    let next = nextPage(doc, currentPage);
    return Response.success(items, next ? String(currentPage + 1) : null);
}
