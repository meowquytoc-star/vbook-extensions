load('config.js');

function execute() {
    return Response.success([
        { title: "Tất cả Manga",  input: BASE_URL + '/manga-2/',                 script: 'gen.js' },
        { title: "Mới cập nhật",  input: BASE_URL + '/manga-2/?orderby=latest',  script: 'gen.js' },
        { title: "Hot nhất",      input: BASE_URL + '/manga-2/?orderby=trending', script: 'gen.js' }
    ]);
}
