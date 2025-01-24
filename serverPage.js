var mysql = require('mysql2');
var con = mysql.createConnection({
  host: "@@@.@@@.@@@.@@@",
  port: "@@@@",
  user: "@@@@@@",
  password: "@@@@@@",
  database: "yachimata_warehouse"
});
const weekday = ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"];
var workflow = require('./test.js');
var orders = require('./CheckOrderID.js');
const handleResponse = (res, data) => res.status(200).send(data);
const handleError = (res, err) => res.status(500).send(err);
var fs = require('fs');
var express = require("express");
var app = express();
const path = require('path');
app.use(express.static(path.join(__dirname)));
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/testLandingPage.html'));

});
app.get('/createOrders', function(req,res){
  sql = "SELECT PalletID, OriginArea FROM Pallets WHERE OutgoingDay is not null"; 
  con.connect(function(err) {
    if (err) throw err;
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
    
  });
});

});

app.post("/request", express.urlencoded({ extended: true }) ,(req, res) => { 
  workflow.startWorkflow(req.body.workflowID)
    .then(data => handleResponse(res, data))
    .catch(err => handleError(res, err));
 /*  var result = "nothing was given back";
   result = workflow.startWorkflow(req.body.workflowID);
    console.log("Order ID being given back from the server: " + result);
    res.send(result);*/
});
app.post("/checkOrder", express.urlencoded({ extended: true }) ,(req, res) => { 
  orders.checkOrderStatus(req.body.orderID, req.body.orderStatus).then(function(results){
  res.send(String(results));
  //var results = workflow.startWorkflow(req.body.workflowID);
  // the message being sent back will be saved in a localSession variable
  // send back a couple list items to be added to the DOM
  //res.send('done!');
  });
});

app.post("/barcode", express.json(), (req,res) =>{
  console.log("読んだバーコード: " + req.body.barcode);
  var barcodeNumber = parseInt(req.body.barcode);
  //もしバーコード読めんかったら別ステーションにおいて行きます
  if(req.body.barcode == "NOREAD"){
    console.log("バーコードデータなかったのでK_Testというステーションに置いて行きます。");
  res.json({stationarea: 'K_Test'});
  } else if(barcodeNumber%2){//バーコードでは奇数だった場合にステーションAに置いて行きます
    console.log("バーコードデータは奇数だったのでAというステーションアリアに置いて行きます。");
    res.json({stationarea: 'Y_A'});
  } else{ //偶数の場合にはBに置いて行きます
    console.log("バーコードデータは偶数だったのでBというステーションアリアに置いて行きます。");
    res.json({stationarea: 'Y_B'});
  }
});

app.post("/stationUpdateDestination", express.json(), (req,res) =>{
console.log("パレットを置いたステーションは: " + req.body.station);
console.log("オーダーをやりましたフォークリフトは: " + req.body.vehicleid);
if(req.body.palletid != undefined){
  console.log("パレットのバーコードは: "+req.body.palletid);
}
console.log("オーダー番号は: " + parseInt(req.body.order));
});

app.post("/stationUpdateSource", express.json(), (req,res) =>{
  console.log("パレットを取りましたステーションは: " + req.body.station);
  console.log("やりましたフォークリフトは: " + req.body.vehicleid);
  });

app.post("/orderStarted", express.json(), (req,res) =>{
    console.log("the order below has been called: " + parseInt(req.body.orderid));
    console.log("By the agilox device: " + req.body.vehicleid);
  });


  app.post("/BeginLoadTruckWorkflow", express.json(), (req,res) =>{
    const d = new Date();
    let day = weekday[d.getDay()];
    console.log("今日は" + day);
    //query the database for all pallets and locations that have the matching day

    sql = "SELECT PalletID, CurrentStation  FROM Pallets WHERE OutgoingDay = ?"; 
    con.connect(function(err) {
      if (err) throw err;
      con.query(sql, [day], function (err, result, fields) {
        if (err) throw err;

       // result = JSON.stringify(result);
        console.log(result);
      for (i=0; i<result.length; i++){
        var currentStation = JSON.stringify(result[i].CurrentStation);
        var palletID = JSON.stringify(result[i].PalletID);
        console.log("calling the pallet with barcode below to be moved to block storage to be loaded into the truck: " + palletID);
      
        let text = '{"@SOURCE": ' + currentStation +'}'
        const obj = JSON.parse(text);
        console.log(obj);
        setTimeout( function() {workflow.startWorkflowDaily("12341234", JSON.stringify(obj)); }, i*3000);
        con.connect(function(err) {
          if (err) throw err;
          var sql = "DELETE FROM Pallets WHERE OutgoingDay = ?";
          con.query(sql, [day], function (err, result) {
            if (err) throw err;
            console.log("Number of records deleted: " + result.affectedRows);
          });
        });
      }});
    });
    
  });
  
  app.post("/addToDatabase", express.json() ,(req, res) => { 
    con.connect(function(err) {
      if (err) throw err;
      var sql = "INSERT INTO Pallets (PalletID, OriginArea) VALUES (?, ?)";
      con.query(sql,[req.body.barcode], [req.body.origin], function (err, result) {
        if (err) throw err;
      });
    });
  });

  app.post("/UpdateDatabase", express.json() ,(req, res) => { 
    con.connect(function(err) {
      if (err) throw err;
      var sql = "UPDATE Pallets SET CurrentStation = ? WHERE PalletID = ?";
      con.query(sql,[req.body.station], [req.body.barcode], function (err, result) {
        if (err) throw err;
      });
    });
  });
  app.post("/PostBarcode", express.json() ,(req, res) => { 
      var object = JSON.parse(req.body);
      console.log(object);
      console.log("読んだQRコード: " + object.SOURCE);
      console.log("読んだQRコード: " + object.DESTINATION);
      console.log("読んだQRコード: " + object.SERIALNUMBER);
      console.log("読んだQRコード: " + object.barcqd);
      var d = new Date();
      var time = d.getTime();
      console.log(d);
      var resolve = "{\"id\":100000010000010017,\"status\":\"success\"}";
      res.send(resolve);

  });

app.post("/GetSource", express.json() ,(req, res) => { 
  console.log(req.body);
  //search list of available barcodes for earliest instance in database where the date is the earliest, and refill has priority
  con.connect(function(err) {
    if (err) throw err;
    var sql = "SELECT PalletID, CurrentStation, Date, IsRefill  FROM PalletDB WHERE PalletID = ? and InTransit = 0";
    con.query(sql,[req.body.barcode], function (err, result) {
      if (err) throw err;
      var noRefill = 1;
      for (i=0; i<result.length; i++){
        if(result[i].IsRefill){
          if(result[i].Date.getDate() < minval){
            noRefill = 0;
            earliestPallet = result[i].CurentStation;
            minval = result[i].Date.getDate();
          } else if (noRefill){
            if (result[i].Date.getDate() < minval){
              earliestPallet = result[i].CurrentStation;
              minval = result[i].Date.getDate();
            }
          }
        }
      }
      res.json({station: earliestPallet});

    });
  });


});
app.use(express.static('WMS_test'));

app.listen(80);

console.log("Running at Port 80");