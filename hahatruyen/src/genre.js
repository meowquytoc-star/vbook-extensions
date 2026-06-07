load('config.js');

const FALLBACK = [
    { title: "Ngôn Tình",       input: "https://hahatruyen.com.vn/vi/64/truyen-tieu-thuyet-ngon-tinh/" },
    { title: "Nữ Cường",        input: "https://hahatruyen.com.vn/vi/66/truyen-ngon-tinh-nu-cuong/" },
    { title: "Tổng Tài",        input: "https://hahatruyen.com.vn/vi/67/truyen-ngon-tinh-tong-tai/" },
    { title: "Sắc Giới (18+)",  input: "https://hahatruyen.com.vn/vi/68/truyen-ngon-tinh-sac-gioi/" },
    { title: "Status Hay",      input: "https://hahatruyen.com.vn/vi/10986/status-hay-ve-cuoc-song/" }
];

function execute() {
    let doc = getDoc(BASE_URL + '/');
    let data = [];
    let seen = {};

    if (doc) {
        doc.select('a[href*="/vi/"]').forEach(function (e) {
            let link = absUrl(e.attr('href') || '');
            if (!link || seen[link]) return;
            if (!/\/vi\/\d+\//.test(link)) return;
            if (/truyen-full-chapter|\/vi\/(?:0|1)\b/.test(link)) return;
            let name = cleanText(e.text());
            if (!name || name.length > 40) return;
            seen[link] = true;
            data.push({ title: name, input: link, script: 'gen.js' });
        });
    }

    if (data.length === 0) {
        FALLBACK.forEach(function (g) {
            data.push({ title: g.title, input: g.input, script: 'gen.js' });
        });
    }
    return Response.success(data);
}
