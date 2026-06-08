load('config.js');

// Lazy Comics: pagination AJAX /load-more-chapters
//   Trả JSON {"html": "<a class=...>...</a>", "has_more": bool}
// Mỗi batch 20 chap.
//
// Tránh phụ thuộc vào Jsoup.parse() trên VBook JS engine — dùng regex trực tiếp
// trên text của JSON để extract URL + tên chương.

const CHAP_PATTERNS = ['/chap-', '/chapter-', '/tap-', '/chuong-'];
const LIST_SELECTORS = [
    '.danh-sach-chuong', '.list-chapter', '#list-chapter',
    '.chapter-list', '#chapter-list-render',
    'ul.list_item_chapter', '.list_item_chapter',
    '[class*=chapter-list]', '[class*=danh-sach]'
].join(', ');

const PAGE_SIZE = 20;
const MAX_PAGES = 200;  // cap 4000 chap, an toàn

function isChapterLink(link, storyBase) {
    if (!link || link.indexOf(BASE_URL) !== 0) return false;
    if (link === storyBase || link === storyBase + '/') return false;
    for (let i = 0; i < CHAP_PATTERNS.length; i++) {
        if (link.indexOf(CHAP_PATTERNS[i]) > -1) return true;
    }
    return /\/(chuong|chap|chapter|tap)[-_]?\d+/i.test(link);
}

function extractSlug(doc, url) {
    // Try data-slug từ #chapter-list-render
    let render = doc.select('#chapter-list-render').first();
    if (render) {
        let s = render.attr('data-slug');
        if (s) return s;
    }
    // Fallback: lấy từ URL /truyen/{slug}
    let m = absUrl(url).match(/\/truyen\/([^\/?#]+)/);
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
        let title = '';
        let h3 = e.select('h3').first();
        if (h3) title = cleanText(h3.text());
        if (!title) title = cleanText(e.text() || e.attr('title') || '');
        if (!title) title = 'Chapter';
        chapters.push({ name: title, url: link, host: BASE_URL });
    });
}

// Lấy raw text từ Http response. VBook các phiên bản API khác nhau.
function readBody(res) {
    if (!res) return '';
    let t = '';
    try { t = res.body(); } catch (e) {}
    if (!t) { try { t = res.text(); } catch (e) {} }
    if (!t) { try { t = res.string(); } catch (e) {} }
    if (!t) {
        try {
            let d = res.html();
            if (d) {
                try { t = d.html(); } catch (e) {}
                if (!t) try { t = d.text(); } catch (e) {}
                if (!t) try { t = d.toString(); } catch (e) {}
            }
        } catch (e) {}
    }
    if (!t) { try { t = res.toString(); } catch (e) {} }
    return t || '';
}

// Unescape JSON string nội bộ: \" → ", \/ → /, \\ → \, \n → newline, \t → tab
function unescapeJsonText(s) {
    if (!s) return '';
    return s.replace(/\\\//g, '/')
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '')
            .replace(/\\t/g, ' ');
}

// Trích chapter <a class="chapter-item" href + <h3>title</h3>> từ HTML string
function extractChaptersFromHtml(htmlStr, storyBase, chapters, seen) {
    if (!htmlStr) return 0;
    let added = 0;

    // Pattern bắt <a ... href="..." ... > ... </a>
    let aRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = aRe.exec(htmlStr)) !== null) {
        let link = m[1];
        let innerHtml = m[2];

        link = link.replace(/&amp;/g, '&').replace(/[?#].*$/, '');
        if (!link) continue;
        if (link.indexOf('http') !== 0) link = absUrl(link);
        if (link.indexOf(BASE_URL) !== 0) continue;
        if (link === storyBase || link === storyBase + '/') continue;
        if (seen[link]) continue;

        // Tên: ưu tiên <h3>...</h3>
        let title = '';
        let h3m = innerHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
        if (h3m) {
            title = h3m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        }
        if (!title) {
            title = innerHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        }
        if (!title) title = 'Chapter';

        seen[link] = true;
        chapters.push({ name: title, url: link, host: BASE_URL });
        added++;
    }
    return added;
}

// Trả về object { html: <unescaped html str>, has_more: bool|null }
// Không tin tưởng JSON.parse — dùng regex để extract field ra khỏi response.
// Cách này robust với mọi JS engine, kể cả khi VBook không có JSON.parse chuẩn.
function fetchLoadMore(slug, offset) {
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
        let txt = readBody(res);
        if (!txt) return null;

        // 1. Extract field "html" — dùng regex thay vì JSON.parse
        let htmlField = '';
        // Tìm "html":"..."  với chấp nhận escape \" bên trong
        let mh = txt.match(/"html"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (mh) {
            htmlField = unescapeJsonText(mh[1]);
        } else {
            // Fallback: nếu JSON đã được auto-unescape bởi readBody (qua doc.html()),
            // dùng nguyên txt như HTML.
            htmlField = txt;
        }

        // 2. Extract has_more flag
        let hasMore = null;
        let mhm = txt.match(/"has_more"\s*:\s*(true|false)/);
        if (mhm) hasMore = (mhm[1] === 'true');

        return { html: htmlField, has_more: hasMore };
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

    // BƯỚC 1: lấy 20 chap đầu từ HTML tĩnh
    let listEl = doc.select(LIST_SELECTORS).first();
    if (listEl) parseChapterAnchors(listEl, chapters, seen, storyBase, false);
    if (chapters.length === 0) parseChapterAnchors(doc, chapters, seen, storyBase, true);

    // BƯỚC 2: paginate AJAX. LUÔN thử khi có slug — kể cả static trả ít hơn 20 chap
    // (vì có thể manga ngắn hoặc theme khác trả batch khác). Server tự dừng qua has_more.
    let slug = extractSlug(doc, url);
    if (slug && chapters.length > 0) {
        // Offset = chapters đã load (server hiểu "skip N chap đầu, trả về 20 chap tiếp")
        let offset = chapters.length;
        for (let i = 0; i < MAX_PAGES; i++) {
            let obj = fetchLoadMore(slug, offset);
            if (!obj) break;
            let html = obj.html || '';
            if (!html) {
                if (obj.has_more === false) break;
                continue;
            }

            let before = chapters.length;
            extractChaptersFromHtml(html, storyBase, chapters, seen);
            let added = chapters.length - before;
            // Không thêm được chap mới → dừng (tránh loop vô tận)
            if (added === 0) break;

            // Offset bước theo số chap server thực sự thêm vào (deterministic + an toàn
            // khi response trả < 20 vì duplicate/hidden chap)
            offset += added;
            if (obj.has_more === false || obj.has_more === undefined) break;
        }
    }

    // Chapters đang desc (mới → cũ). Reverse → asc cho VBook.
    chapters.reverse();

    if (chapters.length === 0) return Response.error("No chapters found.");
    return Response.success(chapters);
}
