function execute() {
    return Response.success([
        { title: "Mới cập nhật",    input: "https://lazycomics.net/truyen-moi-cap-nhat", script: 'gen.js' },
        { title: "Đã hoàn thành",   input: "https://lazycomics.net/truyen-da-hoan",      script: 'gen.js' },
        { title: "Truyện mới",      input: "https://lazycomics.net/truyen-moi",          script: 'gen.js' },
        { title: "Boy Love",        input: "https://lazycomics.net/the-loai/boy-love",   script: 'gen.js' },
        { title: "Yaoi",            input: "https://lazycomics.net/the-loai/yaoi",       script: 'gen.js' },
        { title: "Người Lớn (18+)", input: "https://lazycomics.net/the-loai/nguoi-lon",  script: 'gen.js' },
        { title: "ABO",             input: "https://lazycomics.net/the-loai/abo",        script: 'gen.js' },
        { title: "Manhwa",          input: "https://lazycomics.net/the-loai/manhwa",     script: 'gen.js' },
        { title: "Manga",           input: "https://lazycomics.net/the-loai/manga",      script: 'gen.js' },
        { title: "Webtoon",         input: "https://lazycomics.net/the-loai/webtoon",    script: 'gen.js' }
    ]);
}
