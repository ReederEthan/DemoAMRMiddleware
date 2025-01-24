var firstTimeStatusUpdate = 0;
updateButton = function(buttonID, order){
    console.log("status update checker: " + firstTimeStatusUpdate);
    $.post("/checkOrder",
          {
            orderID : order,
            orderStatus : 0 
          },
          function (data, status) {
            console.log(data);
            if(data == 99 || data == 98){
                if(data == 99){
                    $(buttonID).html('終了!!');
                }
                else{
                    $(buttonID).html('キャンセルしました。');
                }
                firstTimeStatusUpdate = 0;
                setTimeout( function() {$(buttonID).html("workflow " + buttonID); }, 15000);
                return;
            }
            else if (data == 1 && firstTimeStatusUpdate == 0) {
                $(buttonID).html('進行中。お待ちください。');
                firstTimeStatusUpdate++;
                setTimeout( function () {updateButton(buttonID, order)}, 20000);
            }
            else {
                setTimeout( function() {updateButton(buttonID, order)}, 20000);
            }
            
          });
}

$(document).ready(function () {
    $("#200").click(function () {
        $('#200').html('始まっております。');
       $.post("/request",
          {
            workflowID : "200"
          },
          function (data, status) {
            console.log(data);
            updateButton("#200", data);
          });
    });
 });
 $(document).ready(function () {
    $("#203").click(function () {
        $('#203').html('始まっております。');
       $.post("/request",
          {
            workflowID : "203"
          },
          function (data, status) {
            console.log(data);
            updateButton("#203", data);
          })
    });
 });
 $(document).ready(function () {
    $("#300").click(function () {
        $('#300').html('始まっております。');
       $.post("/request",
          {
            workflowID : "300"
          },
          function (data, status) {
            console.log(data);
            updateButton("#300", data);
          });
    });
 });
 $(document).ready(function () {
    $("#301").click(function () {
      $('#301').html('始まっております。');
       $.post("/request",
          {
            workflowID : "301"
          },
          function (data, status) {
            console.log(data);
            updateButton("#301", data);
          });
    });
 });
 $(document).ready(function () {
    $("#501").click(function () {
      $('#501').html('始まっております。');
       $.post("/request",
          {
            workflowID : "501"
          },
          function (data, status) {
            console.log(data);
            updateButton("#501", data);
          });
    });
 });
 $(document).ready(function () {
    $("#502").click(function () {
      $('#502').html('始まっております。');
       $.post("/request",
          {
            workflowID : "502"
          },
          function (data, status) {
            console.log(data);
            updateButton("#502", data);
          });
    });
 });
 $(document).ready(function () {
  $("#889").click(function () {
    $('#889').html('始まっております。');
     $.post("/request",
        {
          workflowID : "889"
        },
        function (data, status) {
          console.log(data);
          updateButton("#889", data);
        });
  });
});