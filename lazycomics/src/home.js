load('config.js');

function execute(page) {
    let url = listPageUrl(BASE_URL + '/truyen-moi-cap-nhat', page);
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load home page.");

    let data = parseComicItems(doc);
    if (data.length === 0) return Response.error("No stories found.");

    let hasMore = !!nextPage(doc, page);
    return Response.success(data, hasMore);
}
