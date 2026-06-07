function execute() {
    return Response.success([
        { title: "Tất cả Manga",  input: "https://cucumbermanga.com/manga-2/",                 script: 'gen.js' },
        { title: "Mới cập nhật",  input: "https://cucumbermanga.com/manga-2/?m_orderby=latest", script: 'gen.js' },
        { title: "Hot nhất",      input: "https://cucumbermanga.com/manga-2/?m_orderby=trending", script: 'gen.js' },
        { title: "Xem nhiều",     input: "https://cucumbermanga.com/manga-2/?m_orderby=views",   script: 'gen.js' },
        { title: "A-Z",           input: "https://cucumbermanga.com/manga-2/?m_orderby=alphabet", script: 'gen.js' },
        { title: "Mới ra mắt",    input: "https://cucumbermanga.com/manga-2/?m_orderby=new-manga", script: 'gen.js' }
    ]);
}
