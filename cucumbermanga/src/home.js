function execute() {
    return Response.success([
        { title: "Tất cả Manga",  input: "https://cucumbermanga.com/manga-2/",                  script: 'gen.js' },
        { title: "Mới cập nhật",  input: "https://cucumbermanga.com/manga-2/?orderby=latest",   script: 'gen.js' },
        { title: "Hot nhất",      input: "https://cucumbermanga.com/manga-2/?orderby=trending",  script: 'gen.js' }
    ]);
}
