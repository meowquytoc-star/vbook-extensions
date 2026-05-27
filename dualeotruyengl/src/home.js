function execute() {
    return Response.success([
        { title: "Tất cả",       input: "https://dualeotruyengl.com/",                script: 'gen.js' },
        { title: "Mới cập nhật", input: "https://dualeotruyengl.com/?orderby=latest", script: 'gen.js' }
    ]);
}
