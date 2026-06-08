load('config.js');

// Cucumbermanga chặn /page/N/ → HTTP 403 (anti-bot)
// Trang 1: HTML tĩnh
// Trang 2+: dùng AJAX madara_load_more (page index Madara: 1-based offset)

function execute(url, page) {
    let p = parseInt(page) || 1;
    let doc;

    if (p <= 1) {
        // Trang 1: HTML tĩnh từ URL gốc (vd /manga-2/?m_orderby=latest)
        doc = getDoc(url);
        if (!doc) return Response.error("Cannot load page.");
    } else {
        // Trang 2+: AJAX
        let orderby = orderbyFromUrl(url);
        // Madara AJAX page=1 trả về 20 truyện trang 2 thực tế
        // VBook page p → Madara AJAX page (p-1)
        doc = fetchMadaraLoadMore(orderby, p - 1);
        if (!doc) return Response.error("Cannot load AJAX page " + p);
    }

    let items = parseMadaraListing(doc);
    if (items.length === 0) return Response.error("No stories found.");

    // Còn trang tiếp khi items đủ 1 batch (Madara mặc định 20/trang)
    let hasNext = items.length >= 18;
    let token = hasNext ? String(p + 1) : null;
    return Response.success(items, token);
}
