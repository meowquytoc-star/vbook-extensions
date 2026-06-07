load('config.js');

const CONTENT_SELECTORS = '#tctcontent, .chapter-content, .entry-content, #chapter-content, article .content';

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    let contentEl = doc.select(CONTENT_SELECTORS).first();
    if (!contentEl) return Response.error("No chapter content found.");

    let lines = [];
    contentEl.select('p, div').forEach(function (el) {
        if (el.select('p, div').size() > 0) return;
        let text = cleanText(el.text());
        if (text) lines.push(text);
    });

    if (lines.length === 0) {
        let raw = cleanText(contentEl.text());
        if (raw) {
            raw.split(/\n+/).forEach(function (l) {
                let t = cleanText(l);
                if (t) lines.push(t);
            });
        }
    }

    if (lines.length === 0) return Response.error("Chapter appears empty.");
    return Response.success(lines.join('\n\n'));
}
