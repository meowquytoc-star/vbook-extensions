load('config.js');

function execute(keyword, page) {
    if (!keyword) return Response.error("No keyword.");
    let res = fetch('https://lazycomics.net/api/search-story?keyword=' + encodeURIComponent(keyword));
    if (!res || !res.ok) return Response.error("Search failed.");

    let items = [];
    try { items = JSON.parse(res.text()); } catch(e) {}
    if (!Array.isArray(items)) return Response.success([]);

    let data = items.map(function(item) {
        return {
            name: item.title || '',
            link: 'https://lazycomics.net/truyen/' + (item.slug || ''),
            cover: coverUrl(item.cover || ''),
            description: '',
            host: 'https://lazycomics.net'
        };
    }).filter(function(i) { return i.name && i.link; });

    return Response.success(data, null);
}
