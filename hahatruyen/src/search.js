load('config.js');

function execute(keyword, page) {
    if (!keyword) return Response.error("No keyword.");
    let url = BASE_URL + '/vi/tim-truyen/?q=' + encodeURIComponent(keyword);
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load search results.");
    let data = parseArticles(doc);
    return Response.success(data, null);
}
