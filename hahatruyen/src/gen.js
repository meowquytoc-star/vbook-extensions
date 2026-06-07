load('config.js');

function fetchAjax(apiUrl, refererUrl, p, catId) {
    let res = null;
    try {
        res = Http.get(apiUrl)
            .header('User-Agent', UA)
            .header('Referer', refererUrl)
            .header('X-Requested-With', 'XMLHttpRequest')
            .header('Accept', 'text/html, */*; q=0.01')
            .execute();
    } catch (e) {}
    if (res && res.ok) return res;

    try {
        res = Http.post(apiUrl)
            .header('User-Agent', UA)
            .header('Referer', refererUrl)
            .header('X-Requested-With', 'XMLHttpRequest')
            .header('Content-Type', 'application/x-www-form-urlencoded')
            .body('page=' + p + '&cat=' + catId)
            .execute();
    } catch (e) {}
    if (res && res.ok) return res;

    try { return fetch(apiUrl); } catch (e) {}
    return null;
}

function execute(url, page) {
    let p = parseInt(page) || 1;

    if (p === 1) {
        let doc = getDoc(url);
        if (!doc) return Response.error("Cannot load page.");
        let data = parseArticles(doc);
        if (data.length === 0) return Response.error("No stories found.");
        return Response.success(data, '2');
    }

    let catId = extractCatId(url);
    if (!catId) return Response.success([], null);

    let apiUrl = BASE_URL + '/getwh/ptm/' + catId + '/' + p;
    let res = fetchAjax(apiUrl, url, p, catId);
    if (!res || !res.ok) return Response.success([], null);

    let body = res.text();
    if (!body || body.length < 10) return Response.success([], null);

    let html = decodeB64(body);
    let data = parseArticlesHtml(html);
    if (data.length === 0) return Response.success([], null);
    return Response.success(data, String(p + 1));
}
