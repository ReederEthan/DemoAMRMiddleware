exports.createDatabaseConnection = function() {
    var mysql = require('mysql2');
    var con = mysql.createConnection({
        host: "@@@.@@@.@@@.@@@",
        port: "@@@@",
        user: "@@@@@",
        password: "@@@@@",
        database: "yachimata_warehouse"
    });
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
       
      });
}
exports.checkBatteryTemp = function (pulseTime) {
    var mysql = require('mysql2');
    var con = mysql.createConnection({
        host: "@@@.@@@.@@@.@@@",
        port: "@@@@",
        user: "@@@@@",
        password: "@@@@@@@",
        database: "yachimata_warehouse"
    });
    var s;
    var strSplitNumberStatus;
    var http = require('http');
    //These options are used to connect to the agilox device to query the order with the provided orderID
    //このオプションで自動フォークリフトと連携出来る
    var options = {
        host: '192.168.0.103',
        port: '8100',
        path: '/ci/17148911',
        method: 'GET'
    }
    let body = [];
    const d = new Date();
    var request = http.request(options, function (response) {
        var str = "";
        //now that we have the order information we can filter for the status code
        //オーダー情報もらったからステータス番号を取る
        response.on('data', function (data) {
           // console.log(d.getUTCMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds());
            body.push(data);
           
        });
        response.on('end', () => {
            var minutes = d.getMinutes();
            if (minutes<10){
                minutes = "0" + minutes;
            }
            var time = d.getHours() + ":" + minutes;
            body = Buffer.concat(body).toString();
            const obj = JSON.parse(body);
           var batteryBinary = (obj.feedback[25]).toString(2);
            for(let i=batteryBinary.length; i<32; i++){
                batteryBinary = "0" + batteryBinary;
            }
            const  batteryTemps = [];
            for(let x= 0; x < 4; x++){
                var sliced= batteryBinary.slice(0+(x*8), 8+(x*8));
                batteryTemps.push(sliced);
            }
            for (let y=0; y<batteryTemps.length; y++){
                var tempInDecimal;
                tempInDecimal = parseInt(batteryTemps[y], 2);
                batteryTemps[y] = tempInDecimal;
            }
            console.log(batteryTemps);
            var sql = "INSERT INTO TimedTemp(PulseTime, Battery1Temp, Battery2Temp, Battery3Temp, ExternalTemp) values (?, ?, ?, ?, ?);";
                con.query(sql, [time, batteryTemps[0],  batteryTemps[1], batteryTemps[2], batteryTemps[3]], function (err, result) {
                  if (err) throw err;
                  console.log("1 record inserted");
                });

            
            
          });
    
    });
    //Report if there was an error with the connection to the device
    //もしエラーあったらエラーメッセージを送る
    request.on('error', function (e) {
        console.log('Problem with request: ' + e.message);
    });
    
    request.end();
    
    
    }

//phase 1 for yotsuba set until i equals 300
for (let i = 0; i <= 300; i++){
    setTimeout(() => this.checkBatteryTemp(i), 60000*i);
};
//phase 2 for yotsuba set until i equals 960. set timeout function to: this.checkBatteryTemp(300+i), 18000000+(300000*i));
for (let i = 1; i <= 192; i++){
    setTimeout(() => this.checkBatteryTemp(i), 900000+(300000*i));
};
//phase 3 for yotsuba set until i equals 360. set timeout function to: this.checkBatteryTemp(1260+i), 306000000+(60000*i));
for (let i = 1; i <= 360; i++){
    setTimeout(() => this.checkBatteryTemp(i), 14400000+(60000*i));
};
