var REALNAMES = 0;
var CODENAMES = 1;

var DEVICES = 0;
var DOWNLOAD = 1;

var COMPANAY = 0;
var DEVICE = 1;
var CARRIER = 2;
var CODENAME = 3;
var META = 4;
var CODENAME_ALT = 5;
var DAYS = 6;

function loadPage(source) {
  var fetch;
  var devices = [""];
  $.getJSON("https://raw.githubusercontent.com/wSedlacek/json_test/master/devices.json", function(result) {
    fetch = result;
    var i = 0;
    while (fetch.devices[i] != null) {
      var device = [""];
      device[COMPANAY] =  fetch.devices[i].company;
      device[DEVICE] =  fetch.devices[i].device;
      device[CARRIER] = fetch.devices[i].carrier;
      device[CODENAME] = fetch.devices[i].codename;
      device[META] = fetch.devices[i].meta;
      device[CODENAME_ALT] = fetch.devices[i].codename_alt;
      device[DAYS] = fetch.devices[i].days;
      devices[i] = device;
      i++;
    }
    if (source == DEVICES)
      loadSupportedDevices(devices);
    else if (source == DOWNLOAD)
      loadDownloadList(devices);
  });
}


function getDevice(type, devices, i, htmlEnabled) {
  var returning = "";
  var thisDevice = false;
  if (devices[i][META] != "")
   thisDevice = checkDevice(devices[i][META]);
  else
   thisDevice = checkDevice(devices[i][DEVICE]);

  if (htmlEnabled) {
    if (thisDevice) {
      returning += "<b>"
    }
    returning += '<li>';
  }

  if (type == REALNAMES) {
    var dash = "";
    if (devices[i][CARRIER] != "") {
      dash = " - ";
    }
    returning += devices[i][COMPANAY] + " " + devices[i][DEVICE] + dash + devices[i][CARRIER];
  } else if (type == CODENAMES) {
    returning += devices[i][3];
  }

  if (htmlEnabled) {
    returning += '<br /></li>';
    if (thisDevice) {
      returning += "</b>"
    }
  }

  return returning;
}

function checkDevice(device) {
  var uagent = navigator.userAgent.toLowerCase();
  if (uagent.search(device.toLowerCase()) > -1)
    return true;
  return false;
}


function loadSupportedDevices(devices) {
  var devices0 = "";
  var devices1 = "";

  for (var i = 0, len = 39; i < len; i++) {
    devices1 += getDevice(REALNAMES, devices, i, true);
    if (i >= len/2 && devices0 == "") {
      devices0 = devices1;
      devices1 = "";
    }
  }

  $('#devices0').html(devices0);
  $('#devices1').html(devices1);
};

function loadDownloadList(devices) {
  for (var i = 0, len = 39; i < len; i++) {
    var device = getDevice(REALNAMES, devices, i, false);
    var codename = devices[i][CODENAME];
    var thisDevice = false;
    if (devices[i][META] != "")
     thisDevice = checkDevice(devices[i][META]);
    else
     thisDevice = checkDevice(devices[i][DEVICE]);

    var variants = 1;
    if (devices[i][CODENAME_ALT] != "") {variants = 2;}
    for (j = 0; j < variants; j++) {
      if (devices[i][DAYS] != "") {
        var option = document.createElement("option");
        var value = "";
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1;
        if (month < 10)
          month = '0' + month;
        var day = dateObj.getUTCDate();
        var weekday = dateObj.getUTCDay();
        var builtToday = devices[i][DAYS].search(weekday) > -1;
        var rewind = 0;
        if (!builtToday) {
          do {
            weekday--;
            if (weekday == 0) weekday = 7;
            var builtThisDay = devices[i][DAYS].search(weekday) > -1;
            rewind++;
          } while (!builtThisDay);
        }
        var year = dateObj.getUTCFullYear();
        newdate = year + month + day - rewind;
        value ='http://downloads.exodus-developers.net/exodus-5.1/'
        + codename + '/exodus-5.1-' + newdate +'-NIGHTLY-'
        + codename + '.zip';


        if (thisDevice) {
          $('#devices').append("<option value='"+ value +"'>" + device +" - "+ codename + "</option>");
          $('#devices').val(value);
          DownloadBtn.href= value;
          MD5Btn.href= value +'.md5';
        } else {
          $('#devices').append("<option value='"+ value +"'>" + device +" - "+ codename + "</option>");
        }
        codename = devices[i][CODENAME_ALT];
      }
    }
  }
}

function checkDeviceLink() {
  if (devices.value == "http://downloads.exodus-developers.net") {
    alert("Please select a device...");
    return false;
  }
  return true;
}
