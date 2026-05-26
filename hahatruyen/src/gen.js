load('config.js');

function execute(url, page) {
    let doc = getDoc(page && page !== '1' && page !== 1 ? listPageUrl(url, page) : normalizeUrl(url));
    if (!doc) return Response.error("Cannot load page.");

    let data = parseArticles(doc);
    let catId = extractCatId(url);
    let np = (data.length >= 12 && catId) ? nextPage(doc, url, page) : null;
    return Response.success(data, np);
}
