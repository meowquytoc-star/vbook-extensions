load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load story.");

    let chapters = [];
    let seen = {};

    // teamsany.com (domain mới): chapter trong #chapter_list, mỗi item là <span class="eps"><a>
    // Selectors cũ giữ làm fallback cho structure cũ
    doc.select('#chapter_list a, .eps a, a.chapter-item, .chapter-list a, .list-chapter a').forEach(function (el) {
        let link = absUrl(el.attr('href') || '').replace(/[?#].*$/, '');
        if (!link || seen[link]) return;
        if (link.indexOf(BASE_URL) !== 0) return;
        // Chỉ giữ link là chapter (có pattern -chap-N)
        if (!/-chap-\d/i.test(link)) return;
        seen[link] = true;
        let noEl = el.select('.chapter-no').first();
        let name = noEl ? ('Chương ' + cleanText(noEl.text())) : cleanText(el.text() || el.attr('title') || '');
        if (!name) name = 'Chapter';
        chapters.push({ name: name, url: link, host: BASE_URL });
    });

    chapters.reverse();

    if (chapters.length === 0) return Response.error("No chapters found.");
    return Response.success(chapters);
}
