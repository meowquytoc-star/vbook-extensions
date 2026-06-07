load('config.js');

const CHAP_PATTERNS = ['/chap-', '/chapter-', '/tap-', '/chuong-'];
const LIST_SELECTORS = [
    '.danh-sach-chuong', '.list-chapter', '#list-chapter',
    '.chapter-list', 'ul.list_item_chapter', '.list_item_chapter',
    '[class*=chapter-list]', '[class*=danh-sach]'
].join(', ');

function isChapterLink(link, storyBase) {
    if (!link || link.indexOf(BASE_URL) !== 0) return false;
    if (link === storyBase || link === storyBase + '/') return false;
    for (let i = 0; i < CHAP_PATTERNS.length; i++) {
        if (link.indexOf(CHAP_PATTERNS[i]) > -1) return true;
    }
    return /\/(chuong|chap|chapter|tap)[-_]?\d+/i.test(link);
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};
    let storyBase = absUrl(url).replace(/\/+$/, '');

    function pushFrom(scope, requirePattern) {
        scope.select('a[href]').forEach(function (e) {
            let link = absUrl(e.attr('href') || '').replace(/[?#].*$/, '');
            if (!link || seen[link]) return;
            if (link.indexOf(BASE_URL) !== 0) return;
            if (link === storyBase || link === storyBase + '/') return;
            if (requirePattern && !isChapterLink(link, storyBase)) return;
            seen[link] = true;
            let name = cleanText(e.text() || e.attr('title') || '') || 'Chapter';
            chapters.push({ name: name, url: link, host: BASE_URL });
        });
    }

    let listEl = doc.select(LIST_SELECTORS).first();
    if (listEl) pushFrom(listEl, false);

    if (chapters.length === 0) pushFrom(doc, true);

    chapters.reverse();
    return Response.success(chapters);
}
