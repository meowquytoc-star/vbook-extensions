load('config.js');

function execute() {
    return Response.success([
        { title: "Tất cả",       input: BASE_URL + '/',                script: 'gen.js' },
        { title: "Mới cập nhật", input: BASE_URL + '/?orderby=latest', script: 'gen.js' }
    ]);
}
