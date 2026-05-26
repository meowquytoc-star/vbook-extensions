load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    // Chapter content is in .userstuff or #chapters .userstuff
    let contentEl = doc.select('#chapters .userstuff, .chapter .userstuff, div.userstuff').first();
    if (!contentEl) {
        // Fallback: whole work content for single-chapter works
        contentEl = doc.select('#workskin, .work-text').first();
    }

    if (!contentEl) return Response.error("No chapter content found.");

    // Build text from paragraphs and headings
    let lines = [];
    contentEl.select('p, h1, h2, h3, h4, br').forEach(function(el) {
        let tag = el.tagName ? el.tagName().toLowerCase() : '';
        if (tag === 'br') {
            lines.push('');
            return;
        }
        let text = cleanText(el.text());
        if (!text) return;
        if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
            lines.push('\n' + text + '\n');
        } else {
            lines.push(text);
        }
    });

    // If no structured paragraphs, fall back to full text
    if (lines.length === 0) {
        let raw = cleanText(contentEl.text());
        if (raw) lines.push(raw);
    }

    if (lines.length === 0) return Response.error("Chapter appears empty.");

    return Response.success(lines.join('\n'));
}
