var workflow = require('./test.js');
exports.startWorkflow = function (workflowID) {
    var orderStatus = 0;
    let body = [];
    var order = require('./CheckOrderID');
    var http = require('http');
    var orderID = "";
    var options = {
        host: '192.168.1.101',
        port: '8100',
        path: '/workflow/200011',
        //path: '/order/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        json:true
    }

    var request = http.request(options, function (response) {
        var str = "";
        response.on('data', function (data) {
            body.push(data);
           
        });
            
        response.on('end', function () {
           str = Buffer.concat(body).toString();
           console.log(str);
           var JSONbig = require('json-bigint');
            const object = JSONbig.parse(str); 
            console.log("orderID: " + object.id);
            console.log("this is the end");
            console.log(object);
        });
    });
    
    request.on('error', function (e) {
        console.log('Problem with request: ' + e.message);
    });
    
    request.end(object);
    }

 this.startWorkflow(1);
   