load('config.js');

function execute() {
    return Response.success([
        { title: "Mới cập nhật",    input: BASE_URL + '/truyen-moi-cap-nhat', script: 'gen.js' },
        { title: "Đã hoàn thành",   input: BASE_URL + '/truyen-da-hoan',      script: 'gen.js' },
        { title: "Truyện mới",      input: BASE_URL + '/truyen-moi',          script: 'gen.js' },
        { title: "Boy Love",        input: BASE_URL + '/the-loai/boy-love',   script: 'gen.js' },
        { title: "Yaoi",            input: BASE_URL + '/the-loai/yaoi',       script: 'gen.js' },
        { title: "Người Lớn (18+)", input: BASE_URL + '/the-loai/nguoi-lon',  script: 'gen.js' },
        { title: "ABO",             input: BASE_URL + '/the-loai/abo',        script: 'gen.js' },
        { title: "Manhwa",          input: BASE_URL + '/the-loai/manhwa',     script: 'gen.js' },
        { title: "Webtoon",         input: BASE_URL + '/the-loai/webtoon',    script: 'gen.js' }
    ]);
}
