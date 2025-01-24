exports.startWorkflow = function (workflowID) {
var orderStatus = 0;
let body = [];
var order = require('./CheckOrderID');
var http = require('http');
var orderID = "";
var options = {
    host: '192.168.1.101',
    port: '8100',
    path: '/workflow/' + workflowID,
    method: 'POST'
}

var request = http.request(options, function (response) {
    var str = "";
    response.on('data', function (data) {
        body.push(data);
       // console.log("starting check loop");
        //order.checkUntilFinished(orderID, orderStatus);
    });
        /*order.checkOrderStatus(orderID, orderStatus).then(function(orderReturned){
          console.log("The Order Status: " + orderReturned);
          orderStatus = orderReturned;
      }); */
    response.on('end', function () {
        str = Buffer.concat(body).toString();
        const strSplit = str.split("\"");
        orderID = strSplit[6].substring(1,strSplit[6].length-1);
        console.log("orderID: " + orderID);
        console.log("this is the end");
        Promise.resolve(orderID);
    });
});

request.on('error', function (e) {
    console.log('Problem with request: ' + e.message);
});

request.end();
return new Promise(function(resolve, reject) {  
    setTimeout( function() {resolve(orderID); }, 1500);
  });
}
exports.startWorkflowDaily = function (workflowID, source) {
    let body = [];
    console.log(source);
    var orderStatus = 0;
    var order = require('./CheckOrderID');
    var http = require('http');
    var orderID = "";
    var options = {
        host: '192.168.1.101',
        port: '8100',
        path: '/workflow/' + workflowID,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        json:true
    }
    
    var request = http.request(options,  function (response) {
        var str = "";
        response.on('data', function (data) {
            body.push(data);
          
        });
           
        response.on('end', function () {
            str = Buffer.concat(body).toString();
            const strSplit = str.split("\"");
            orderID = strSplit[6].substring(1,strSplit[6].length-1);
            console.log("orderID: " + orderID);
        });
    });
    
    request.on('error', function (e) {
        console.log('Problem with request: ' + e.message);
    });
    
    request.end(source);
    }
    