load('config.js');

function searchApi(keyword) {
    try {
        let res = Http.get(BASE_URL + '/api/search-story?keyword=' + encodeURIComponent(keyword))
            .header('User-Agent', UA)
            .header('Referer', BASE_URL + '/')
            .header('X-Requested-With', 'XMLHttpRequest')
            .header('Accept', 'application/json, text/plain, */*')
            .execute();
        if (!res || !res.ok) return null;
        let items = JSON.parse(res.text());
        if (!Array.isArray(items)) return null;
        return items.map(function (item) {
            let slug = item.slug || item.url || '';
            return {
                name: cleanText(item.title || item.name || ''),
                link: /^https?:\/\//.test(slug) ? slug : (BASE_URL + '/truyen/' + slug.replace(/^\/+/, '')),
                cover: coverUrl(item.cover || item.image || ''),
                description: cleanText(item.description || ''),
                host: BASE_URL
            };
        }).filter(function (i) { return i.name && i.link; });
    } catch (e) { return null; }
}

function searchHtml(keyword) {
    let doc = getDoc(BASE_URL + '/tim-kiem?keyword=' + encodeURIComponent(keyword));
    if (!doc) return [];
    return parseStoryList(doc);
}

function execute(keyword, page) {
    if (!keyword) return Response.error("No keyword.");
    if ((parseInt(page) || 1) > 1) return Response.success([], null);

    let data = searchApi(keyword);
    if (!data || data.length === 0) data = searchHtml(keyword);
    return Response.success(data || [], null);
}
