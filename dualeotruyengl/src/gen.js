load('config.js');

function execute(url, page) {
    let p = '' + (page || '');
    let pageUrl;
    if (!p || p === '1') {
        pageUrl = url;
    } else if (/^https?:\/\//i.test(p)) {
        pageUrl = p;
    } else {
        pageUrl = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'page=' + p;
    }

    let doc = getDoc(pageUrl);
    if (!doc) return Response.error("Cannot load genre page.");

    let items = parseListing(doc);
    if (items.length === 0) return Response.error("No stories found.");

    let nextUrl = nextPageUrl(doc, pageUrl);
    return Response.success(items, nextUrl || null);
}
