load('config.js');

// Lazy Comics dùng pagination AJAX /load-more-chapters
// Mỗi response trả JSON {html, has_more} (20 chap/lần)
// Vòng lặp offset 20, 40, 60... cho tới has_more === false.

const CHAP_PATTERNS = ['/chap-', '/chapter-', '/tap-', '/chuong-'];
const LIST_SELECTORS = [
    '.danh-sach-chuong', '.list-chapter', '#list-chapter',
    '.chapter-list', '#chapter-list-render',
    'ul.list_item_chapter', '.list_item_chapter',
    '[class*=chapter-list]', '[class*=danh-sach]'
].join(', ');

const PAGE_SIZE = 20;
const MAX_PAGES = 200;  // an toàn: cap 4000 chap

function isChapterLink(link, storyBase) {
    if (!link || link.indexOf(BASE_URL) !== 0) return false;
    if (link === storyBase || link === storyBase + '/') return false;
    for (let i = 0; i < CHAP_PATTERNS.length; i++) {
        if (link.indexOf(CHAP_PATTERNS[i]) > -1) return true;
    }
    return /\/(chuong|chap|chapter|tap)[-_]?\d+/i.test(link);
}

function extractSlug(doc, url) {
    // 1. Try data-slug attribute (#chapter-list-render data-slug="bat-quy-tac")
    let render = doc.select('#chapter-list-render').first();
    if (render) {
        let s = render.attr('data-slug');
        if (s) return s;
    }
    // 2. Fallback: extract from URL /truyen/{slug}
    let u = absUrl(url);
    let m = u.match(/\/truyen\/([^\/?#]+)/);
    if (m) return m[1];
    return '';
}

function parseChapterAnchors(scope, chapters, seen, storyBase, requirePattern) {
    scope.select('a[href]').forEach(function (e) {
        let link = absUrl(e.attr('href') || '').replace(/[?#].*$/, '');
        if (!link || seen[link]) return;
        if (link.indexOf(BASE_URL) !== 0) return;
        if (link === storyBase || link === storyBase + '/') return;
        if (requirePattern && !isChapterLink(link, storyBase)) return;
        seen[link] = true;
        // Tên chapter: ưu tiên <h3> trong link (cấu trúc Lazy Comics)
        let title = '';
        let h3 = e.select('h3').first();
        if (h3) title = cleanText(h3.text());
        if (!title) title = cleanText(e.text() || e.attr('title') || '');
        if (!title) title = 'Chapter';
        chapters.push({ name: title, url: link, host: BASE_URL });
    });
}

function fetchLoadMore(slug, offset) {
    // GET /load-more-chapters?slug=X&offset=N&sortByPosition=desc
    let url = BASE_URL + '/load-more-chapters?slug=' + encodeURIComponent(slug)
            + '&offset=' + offset + '&sortByPosition=desc';
    try {
        let res = Http.get(url)
            .header('User-Agent', UA)
            .header('Referer', BASE_URL + '/truyen/' + slug)
            .header('X-Requested-With', 'XMLHttpRequest')
            .header('Accept', 'application/json, text/javascript, */*; q=0.01')
            .execute();
        if (!res || !res.ok) return null;
        // Đọc body dạng text rồi JSON.parse
        let txt = '';
        try { txt = res.body(); } catch (e) {}
        if (!txt) { try { txt = res.text(); } catch (e) {} }
        if (!txt) { try { txt = res.string(); } catch (e) {} }
        if (!txt) return null;
        return JSON.parse(txt);
    } catch (e) {
        return null;
    }
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};
    let storyBase = absUrl(url).replace(/\/+$/, '');

    // BƯỚC 1: lấy 20 chap đầu từ static HTML
    let listEl = doc.select(LIST_SELECTORS).first();
    if (listEl) parseChapterAnchors(listEl, chapters, seen, storyBase, false);
    if (chapters.length === 0) parseChapterAnchors(doc, chapters, seen, storyBase, true);

    // BƯỚC 2: paginate /load-more-chapters nếu phát hiện slug + đã có >= 20 chap
    let slug = extractSlug(doc, url);
    if (slug && chapters.length >= PAGE_SIZE) {
        let offset = chapters.length;
        for (let i = 0; i < MAX_PAGES; i++) {
            let obj = fetchLoadMore(slug, offset);
            if (!obj || !obj.html) break;

            // Parse HTML chunk
            let chunkDoc = null;
            try { chunkDoc = Jsoup.parse(obj.html); } catch (e) {}
            if (!chunkDoc) {
                try { chunkDoc = Http.get('data:text/html,' + encodeURIComponent(obj.html)).execute().html(); } catch (e) {}
            }
            if (!chunkDoc) break;

            let before = chapters.length;
            parseChapterAnchors(chunkDoc, chapters, seen, storyBase, false);
            // Không thêm chap nào → dừng (tránh loop vô tận)
            if (chapters.length === before) break;

            offset = chapters.length;
            if (obj.has_more === false || obj.has_more === undefined) break;
        }
    }

    // BƯỚC 3: chapter đang desc (mới → cũ). Reverse → asc cho VBook.
    chapters.reverse();

    if (chapters.length === 0) return Response.error("No chapters found.");
    return Response.success(chapters);
}
