load('config.js');

function execute() {
    let items = [
        { name: 'Mới Cập Nhật', link: BASE_URL + '/truyen-moi-cap-nhat', cover: '', host: BASE_URL },
        { name: 'Đã Hoàn Thành', link: BASE_URL + '/truyen-da-hoan', cover: '', host: BASE_URL },
        { name: 'BoyLove / BL', link: BASE_URL + '/the-loai/boylove', cover: '', host: BASE_URL },
        { name: 'Yaoi', link: BASE_URL + '/the-loai/yaoi', cover: '', host: BASE_URL },
        { name: 'Manhwa', link: BASE_URL + '/the-loai/manhwa', cover: '', host: BASE_URL },
        { name: '18+', link: BASE_URL + '/the-loai/18', cover: '', host: BASE_URL },
    ];

    // Also add all genres from site navigation
    let doc = getDoc(BASE_URL + '/');
    if (doc) {
        let seen = {};
        items.forEach(function(i) { seen[i.link] = true; });
        doc.select('a[href*="/the-loai/"]').forEach(function(el) {
            let link = normalizeUrl(el.attr('href') || '');
            if (!link || seen[link]) return;
            seen[link] = true;
            let name = cleanText(el.text());
            if (!name || name.length < 2) return;
            items.push({ name: name, link: link, cover: '', host: BASE_URL });
        });
    }

    return Response.success(items);
}
