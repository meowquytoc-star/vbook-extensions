load('config.js');

const CHAP_PATTERNS = [
    { pat: 'truyen-full-chapter', re: /truyen-full-chapter-(\d+)/i, url: 'truyen-full-chapter-' },
    { pat: 'chapter-',            re: /chapter-(\d+)/i,             url: 'chapter-' },
    { pat: 'chuong-',             re: /chuong-(\d+)/i,              url: 'chuong-' }
];

function scanPattern(doc, storyBase, conf, chapMap) {
    let maxChap = 0;
    doc.select('a[href*="' + conf.pat + '"]').forEach(function (e) {
        let link = absUrl(e.attr('href') || '');
        if (!link || link.indexOf(storyBase) !== 0) return;
        let m = link.match(conf.re);
        if (!m) return;
        let n = parseInt(m[1]);
        if (n > maxChap) maxChap = n;
        if (!chapMap[n]) {
            chapMap[n] = cleanText(e.text() || e.attr('title') || '') || ('Chương ' + n);
        }
    });
    return maxChap;
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let storyBase = absUrl(url).replace(/\/+$/, '');
    let chapMap = {};
    let maxChap = 0;
    let urlPrefix = 'truyen-full-chapter-';

    for (let i = 0; i < CHAP_PATTERNS.length; i++) {
        let conf = CHAP_PATTERNS[i];
        let n = scanPattern(doc, storyBase, conf, chapMap);
        if (n > 0) {
            if (n > maxChap) { maxChap = n; urlPrefix = conf.url; }
            break;
        }
    }

    let bodyEl = doc.select('body').first();
    let pageText = cleanText(bodyEl ? bodyEl.text() : '');
    let totalM = pageText.match(/(\d{2,5})\s*(?:chương|chuong|chapter)/i);
    if (totalM && parseInt(totalM[1]) > maxChap) maxChap = parseInt(totalM[1]);

    if (maxChap === 0) {
        let titleEl = doc.select('h1').first();
        let title = cleanText(titleEl ? titleEl.text() : '') || 'Chương 1';
        return Response.success([{ name: title, url: storyBase + '/', host: BASE_URL }]);
    }

    let chapters = [];
    for (let i = 1; i <= maxChap; i++) {
        chapters.push({
            name: chapMap[i] || ('Chương ' + i),
            url: storyBase + '/' + urlPrefix + i + '/',
            host: BASE_URL
        });
    }
    return Response.success(chapters);
}
