load('config.js');

function execute(url, page) {
    let p = parseInt(page) || 1;
    let doc = getDoc(listPageUrl(url, p));
    if (!doc) return Response.error("Cannot load page.");

    let items = parseComicItems(doc);
    if (items.length === 0) return Response.error("No stories found.");

    let token = hasNextPage(doc, p) ? String(p + 1) : null;
    return Response.success(items, token);
}
