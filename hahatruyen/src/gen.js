load('config.js');

function execute(url, page) {
    let doc = getDoc(normalizeUrl(url));
    if (!doc) return Response.error("Cannot load page.");

    let data = parseArticles(doc);
    return Response.success(data, null);
}
