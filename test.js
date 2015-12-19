var shttp = require('socks5-http-client');

shttp.get('http://www.google.com/', function(res) {
    res.setEncoding('utf8');
    res.on('readable', function() {
        console.log(res.read()); // Log response to console.
    });
});
