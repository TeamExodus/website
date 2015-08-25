function loadSupportedDevices() {
  var devices = getDevices(true, true);
  var devices0 = "";
  var devices1 = "";

  for (var i = 0, len = devices.length; i < len; i++) {
    devices1 += devices[i];
    if (i >= len/2 && devices0 == "") {
      devices0 = devices1;
      devices1 = "";
    }
  }

  $('#devices0').html(devices0);
  $('#devices1').html(devices1);
};

function loadDevicesList() {
  var devices = getDevices(false, true);
  var codename = getDevices(false, false);

  for (var i = 0, len = devices.length; i < len; i++) {
    var option = document.createElement("option");
    var value = "";
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    if (month < 10)
      month = '0' + month;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    newdate = year + month + day-1;
    value ='http://exodus-developers.net/exodus-5.1/'
    + codename[i] + '/exodus-5.1-' + newdate +'-NIGHTLY-'
    + codename[i] + '.zip';

    if (checkDevice(codename[i])) {
      $('#devices').append("<option value='"+ value +"'>" + devices[i] +" - "+ codename[i] + "</option>");
      $('#devices').val(value);
      DownloadBtn.href= value;
      MD5Btn.href= value +'.md5';
    } else {
      $('#devices').append("<option value='"+ value +"'>" + devices[i] +" - "+ codename[i] + "</option>");
    }
  }
}


function getDevices(htmlEnabled, realNames, sorting) {
  var devices = new Array();
  $.ajax({
    url: 'https://raw.githubusercontent.com/TeamExodus/vendor_exodus_devices/EXODUS-5.1/exodus-build-targets',
    type: 'get',
    dataType: 'html',
    async: false,
    success: function(data) {
      var lines = data.split("\n");
      for (var i = 0, len = lines.length; i < len; i++) {
        if (lines[i] != "#supported devices" && lines[i] != "#end of supported devices"
            && lines[i] != "") {
          device = lines[i].replace("exodus_", "");
          device = device.replace("-userdebug", "");
          devices[i] = "";
          if (htmlEnabled) {
            if (checkDevice(device)) {
              devices[i] += "<b>"
            }
            devices[i] += '<li>';
          }
          var currentDevice = deviceCodeNameSorted(device);
          if (realNames)
            currentDevice = deviceRealName(device); 
          currentDevice.forEach(function(entry) {
            if(typeof entry != "undefined")
              devices[i] += entry;
            else if (i == 0)
              devices[i] += device;      
          });
          if (htmlEnabled) {
            devices[i] += '<br /></li>';
            if (checkDevice(device)) {
              devices[i] += "</b>"
            }
          }
        }
      }
    }
  });
  devices.sort(function(a, b){
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
  });
  devices.pop();

  if (!realNames) {
    for (var i = 0, len = devices.length; i < len; i++) {
      if ((devices[i][0] == Math.floor(i / 10) + 1)) {
        fixed=devices[i].toString().substring(3);
        devices[i] = fixed;
      }
      if (devices[i][0] == "9") {
        fixed = devices[i].toString().substring(4);
        devices[i] = fixed;
      }
    }
  }

  return devices;
}

function checkDevice(device) {
  var uagent = navigator.userAgent.toLowerCase();
  if (uagent.search(deviceRealName(device)[1].toLowerCase()) > -1)
    return true;
  return false;
}

function deviceRealName(device) {
  if (device == "bacon")
    return ["OnePlus ","One",""];
  if (device == "d2spr")
    return ["Samsung ","Galaxy S3"," - Sprint"];
  if (device == "d850")
    return ["LG ","G3"," - AT&T"];
  if (device == "d851")
    return ["LG ","G3"," - T Mobile"];
  if (device == "d852")
    return ["LG ","G3"," - Rogers"];
  if (device == "d855")
    return ["LG ","G3",""];
  if (device == "deb")
    return ["Google ","Nexus 7"," (2013)"];
  if (device == "flo")
    return ["Google ","Nexus 7"," (2012)"];
  if (device == "flounder")
    return ["Google ","Nexus 9",""];
  if (device == "f400")
    return ["LG ","G4",""];
  if (device == "falcon")
    return ["Motorola ","Moto G",""];
  if (device == "find7")
    return ["Oppo ","Find 7",""];
  if (device == "hammerhead")
    return ["Google ","Nexus 5",""];
  if (device == "hammerheadcaf")
    return ["Google ","Nexus 5"," CAF"];
  if (device == "jfltespr")
    return ["Samsung ","Galaxy S4"," - Sprint"];
  if (device == "jfltevzw")
    return ["Samsung ","Galaxy S4"," - Verizon"];
  if (device == "ls990")
    return ["LG ","G3"," - Sprint"];
  if (device == "klte")
    return ["Samsung ","Galaxy S5",""];
  if (device == "kltespr")
    return ["Samsung ","Galaxy S5"," - Sprint"];
  if (device == "lettuce")
    return ["YU ","Yuphoria",""];
  if (device == "m7")
    return ["HTC ","One M7",""];
  if (device == "m8")
    return ["HTC ","One M9",""];
  if (device == "mako")
    return ["Google ","Nexus 4",""];
  if (device == "manta")
    return ["Google ","Nexus 10",""];
  if (device == "n7100")
    return ["Samsung ","Galaxy Note 2",""];
  if (device == "obake")
    return ["Motorola ","Droid Turbo",""];
  if (device == "picassowifi")
    return ["Samsung ","Galaxy Tab Pro 10.1"," - Wifi"];
  if (device == "scorpion")
    return ["Sony ","Xperia Z3 Tablet Compact",""];
  if (device == "scorpion_windy")
    return ["Sony ","Xperia Z3 Tablet Compact"," - Wifi"];
  if (device == "shamu")
    return ["Google ","Nexus 6",""];
  if (device == "sprout4")
    return ["Google ","Android One",""];
  if (device == "titan")
    return ["Motorola ","Moto G"," (2014)"];
  if (device == "tomato")
    return ["YU ","Yureka",""];
  if (device == "v500")
    return ["LG ","G-Pad"," 8.3"];
  if (device == "ville")
    return ["HTC ","One S",""];
  if (device == "vs985")
    return ["LG ","G3"," - Verizon"];
  if (device == "xt907")
    return ["Motorola ","Droid RAZR M",""];
  if (device == "xt926")
    return ["Motorola ","Droid RAZR HD",""];
  if (device == "z3")
    return ["Sony ","Xperia Z3",""];
  if (device == "z3c")
    return ["Sony ","Xperia Z3 Compact",""];
  return ["",device,""];
}
function deviceCodeNameSorted(device) {
  if (device == "bacon")
    return ["35 ",device,""];
  if (device == "d2spr")
    return ["38 ",device,""];
  if (device == "d850")
    return ["24 ",device,""];
  if (device == "d851")
    return ["27 ",device,""];
  if (device == "d852")
    return ["25 ",device,""];
  if (device == "d855")
    return ["23 ",device,""];
  if (device == "deb")
    return ["17 ",device,""];
  if (device == "flo")
    return ["16 ",device,""];
  if (device == "flounder")
    return ["18 ",device,""];
  if (device == "f400")
    return ["29 ",device,""];
  if (device == "falcon")
    return ["33 ",device,""];
  if (device == "find7")
    return ["36 ",device,""];
  if (device == "hammerhead")
    return ["13 ",device,""];
  if (device == "hammerheadcaf")
    return ["14 ",device,""];
  if (device == "jfltespr")
    return ["39 ",device,""];
  if (device == "jfltevzw")
    return ["40 ",device,""];
  if (device == "ls990")
    return ["26 ",device,""];
  if (device == "klte")
    return ["41 ",device,""];
  if (device == "kltespr")
    return ["42 ",device,""];
  if (device == "lettuce")
    return ["48 ",device,""];
  if (device == "m7")
    return ["19 ",device,""];
  if (device == "m8")
    return ["20 ",device,""];
  if (device == "mako")
    return ["12 ",device,""];
  if (device == "manta")
    return ["11 ",device,""];
  if (device == "n7100")
    return ["37 ",device,""];
  if (device == "obake")
    return ["32 ",device,""];
  if (device == "picassowifi")
    return ["43 ",device,""];
  if (device == "scorpion")
    return ["46 ",device,""];
  if (device == "scorpion_windy")
    return ["47 ",device,""];
  if (device == "shamu")
    return ["15 ",device,""];
  if (device == "sprout4")
    return ["10 ",device,""];
  if (device == "titan")
    return ["34 ",device,""];
  if (device == "tomato")
    return ["49 ",device,""];
  if (device == "v500")
    return ["22 ",device,""];
  if (device == "ville")
    return ["21 ",device,""];
  if (device == "vs985")
    return ["28 ",device,""];
  if (device == "xt907")
    return ["31 ",device,""];
  if (device == "xt926")
    return ["30 ",device,""];
  if (device == "z3")
    return ["44 ",device,""];
  if (device == "z3c")
    return ["45 ",device,""];
  return ["999 ",device,""];
}

function checkDeviceLink() {
  if (devices.value == "http://exodus-developers.net") {
    alert("Please select a device...");
    return false;
  }
  return true;
}
