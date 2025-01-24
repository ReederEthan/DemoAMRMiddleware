//This is a method to check the status of the order with 99 meaning the order is complete
//この関数はオーダーステータスをチェックする。９９の意味はオーダー終了
exports.checkOrderStatus = function (orderID, statusNumber) {
var orderID;
var strSplitNumberStatus;
var http = require('http');
let body = [];
//These options are used to connect to the agilox device to query the order with the provided orderID
//このオプションで自動フォークリフトと連携出来る
var options = {
    host: '192.168.1.101',
    port: '8100',
    path: '/order/' + orderID,
    method: 'GET'
}
var request = http.request(options, function (response) {
    var str = ""
    //now that we have the order information we can filter for the status code
    //オーダー情報もらったからステータス番号を取る
    response.on('data', function (data) {
        body.push(data);
        
    });

    response.on('end', () => {
        str = Buffer.concat(body).toString();
        const strSplit = str.split("status");
        const strSplitNumber = strSplit[1].split(":");
        strSplitNumberStatus = strSplitNumber[1].split(",");
        strSplitNumberStatus[0] = strSplitNumberStatus[0].trim();
        //We have now filtered out the status number and will store it in the variable below
        //ステータス番号を取り終わって以下の変数に入る
        statusNumber = parseInt(strSplitNumberStatus[0]);
    });

});
//Report if there was an error with the connection to the device
//もしエラーあったらエラーメッセージを送る
request.on('error', function (e) {
    console.log('Problem with request: ' + e.message);
});

request.end();
//Now we will return the status code to whatever called this function
//この関数をコールした所にステータス番号を送る
return new Promise(function(resolve, reject) {  
    setTimeout( function() {resolve(statusNumber); }, 1500);
  });
}

//This function will recursively check for the order to be finished
//この関数はオーダーを終わったまでに再帰的にチェックする
exports.checkUntilFinished = function (orderID, orderStatus) {
var order = require('./CheckOrderID');
return new Promise(function(resolve, reject) {
order.checkOrderStatus(orderID, orderStatus).then(function(result){
    console.log("result check." + result);
    //If the order status is 99 then the order is finished, and we can stop checking
    //オーダーステータス番号は９９だったらオーダーが終わりました。なのでチェックも終わる。
    if(result == 99 || result == 98){
        resolve();
    }
    //if its not 99, wait 20 seconds then check again
    //もし９９じゃなかったら20秒を待ってもう一度チェックする。
    else{
   setTimeout( function() {order.checkUntilFinished(orderID, orderStatus);}, 20000);
    }
});
});
}
exports.checkOrderTimeStamp = function (orderID) {
    let body = [];
    var orderID;
    var strSplitNumberTime;
    var http = require('http');
    //These options are used to connect to the agilox device to query the order with the provided orderID
    //このオプションで自動フォークリフトと連携出来る
    var options = {
        host: '192.168.1.101',
        port: '8100',
        path: '/order/' + orderID,
        method: 'GET'
    }
    var request = http.request(options, function (response) {
        var str = ""
        //now that we have the order information we can filter for the status code
        //オーダー情報もらったからステータス番号を取る
        response.on('data', function (data) {
            body.push(data);
        });

        response.on('end', () => {
            str = Buffer.concat(body).toString();
            const strSplit = str.split("timestamp");
            const strSplitNumber = strSplit[1].split(":");
            strSplitNumberTime = strSplitNumber[1].split(",");
            strSplitNumberTime[0] = strSplitNumberTime[0].trim();
            //We have now filtered out the status number and will store it in the variable below
            //ステータス番号を取り終わって以下の変数に入る
            timeStamp = parseInt(strSplitNumberTime[0]);
        });
    
    });
    //Report if there was an error with the connection to the device
    //もしエラーあったらエラーメッセージを送る
    request.on('error', function (e) {
        console.log('Problem with request: ' + e.message);
    });
    
    request.end();
    //Now we will return the status code to whatever called this function
    //この関数をコールした所にステータス番号を送る
    return new Promise(function(resolve, reject) {  
        setTimeout( function() {resolve(timeStamp); }, 1500);
      });
    }
