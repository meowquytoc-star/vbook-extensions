let BASE_URL = 'https://archiveofourown.org';
try { if (CONFIG_URL) BASE_URL = CONFIG_URL; } catch(e) {}

function cleanText(text) {
    if (!text) return '';
    return ('' + text).replace(/\s+/g, ' ').trim();
}

function normalizeUrl(url) {
    if (!url) return '';
    url = ('' + url).replace(/&amp;/g, '&').trim();
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return BASE_URL + url;
    if (!/^https?:\/\//i.test(url)) return BASE_URL + '/' + url;
    return url;
}

function adultUrl(url) {
    url = normalizeUrl(url);
    if (url.indexOf('view_adult=true') === -1) {
        url += (url.indexOf('?') >= 0 ? '&' : '?') + 'view_adult=true';
    }
    return url;
}

function getDoc(url) {
    let res = fetch(adultUrl(url));
    if (res && res.ok) return res.html();
    return null;
}

function listPageUrl(base, page) {
    if (!page || page === '1' || page === 1) return adultUrl(base);
    let p = '' + page;
    if (/^https?:\/\//i.test(p) || p.startsWith('/')) return adultUrl(p);
    let url = normalizeUrl(base).replace(/\/+$/, '');
    let sep = url.indexOf('?') >= 0 ? '&' : '?';
    return url + sep + 'page=' + p + '&view_adult=true';
}

function nextPage(doc) {
    let el = doc.select('a[rel=next], .next a, li.next a').first();
    return el ? adultUrl(el.attr('href')) : null;
}

function workItem(el) {
    let linkEl = el.select('h4.heading a, .header .heading a, h4 a').first();
    if (!linkEl) return null;
    let link = normalizeUrl(linkEl.attr('href') || '');
    if (!link || link.indexOf('/works/') === -1) return null;
    let name = cleanText(linkEl.attr('title') || linkEl.text());
    if (!name) return null;

    let authorEl = el.select('a[rel=author], .heading a[rel=author]').first();
    let author = authorEl ? cleanText(authorEl.text()) : '';

    let summaryEl = el.select('.summary blockquote, .summary p').first();
    let desc = summaryEl ? cleanText(summaryEl.text()) : '';

    let tags = [];
    el.select('.tags .tag').forEach(function(t) { tags.push(cleanText(t.text())); });
    if (tags.length > 0 && desc) desc = tags.join(', ') + '\n' + desc;
    else if (tags.length > 0) desc = tags.join(', ');

    return { name: name, link: link, cover: '', description: desc, author: author, host: BASE_URL };
}

function execute() {
    return Response.success({ ok: true });
}
