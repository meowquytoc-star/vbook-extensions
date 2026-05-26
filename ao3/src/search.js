load('config.js');

function execute(keyword, page) {
    if (!keyword) return Response.error("No keyword provided.");
    let q = encodeURIComponent(keyword);
    let base = BASE_URL + '/works/search?work_search[query]=' + q + '&work_search[sort_column]=revised_at';
    let url = listPageUrl(base, page);
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load search results.");

    let data = [];
    let seen = {};
    doc.select('li.work, article.work').forEach(function(e) {
        let item = workItem(e);
        if (item && !seen[item.link]) {
            seen[item.link] = true;
            data.push(item);
        }
    });

    return Response.success(data, nextPage(doc));
}
