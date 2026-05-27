load('config.js');

function execute() {
    return Response.success([
        { title: "Mới cập nhật",     input: BASE_URL + '/vi/68/truyen-ngon-tinh-sac-gioi/',   script: 'gen.js' },
        { title: "Ngôn Tình",        input: BASE_URL + '/vi/64/truyen-tieu-thuyet-ngon-tinh/', script: 'gen.js' },
        { title: "Nữ Cường",         input: BASE_URL + '/vi/66/truyen-ngon-tinh-nu-cuong/',    script: 'gen.js' },
        { title: "Tổng Tài",         input: BASE_URL + '/vi/67/truyen-ngon-tinh-tong-tai/',    script: 'gen.js' },
        { title: "Sắc Giới (18+)",   input: BASE_URL + '/vi/68/truyen-ngon-tinh-sac-gioi/',   script: 'gen.js' },
        { title: "Status Hay",       input: BASE_URL + '/vi/10986/status-hay-ve-cuoc-song/',   script: 'gen.js' }
    ]);
}
