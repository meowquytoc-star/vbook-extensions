load('config.js');

function execute(keyword, page) {
    if (!keyword) return Response.error("No keyword.");
    let p = parseInt(page) || 1;
    let url = BASE_URL + '/tim-kiem?q=' + encodeURIComponent(keyword);
    let doc = getDoc(listPageUrl(url, p));
    if (!doc) return Response.error("Cannot search.");

    let items = parseComicItems(doc);
    let token = hasNextPage(doc, p) ? String(p + 1) : null;
    return Response.success(items, token);
}
