// nạp module http
const http = require('http');

// tạo 1 hàm hello
function sayHi(request, respond){
    respond.writeHead(200, {'content-type':'text/html'});
    respond.end('hello world');
}

// tạo server
const server = http.createServer(sayHi);

// tạo lắng nghe sự kiện cổng tùy chọn: 3030
server.listen(3030, ()=>{
    console.log('server đang chạy trên cổng 3030!');
})