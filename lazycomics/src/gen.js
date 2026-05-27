load('config.js');

function execute(url, page) {
    let pageUrl = listPageUrl(url, page);
    let doc = getDoc(pageUrl);
    if (!doc) return Response.error("Cannot load page.");

    let data = parseComicItems(doc);
    if (data.length === 0) return Response.error("No stories found.");

    let currentPage = parseInt(page) || 1;
    let nextPageUrl = nextPage(doc, currentPage);
    let token = nextPageUrl ? String(currentPage + 1) : null;
    return Response.success(data, token);
}
