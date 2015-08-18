$(function() {
  $.get('https://raw.githubusercontent.com/TeamExodus/vendor_exodus_devices/EXODUS-5.1/exodus-build-targets', function(data) {
    var lines = data.split("\n");
    var devices = [""];
    var devices0 = "";
    var devices1 = "";
    for (var i = 0, len = lines.length; i < len; i++) {
      if (lines[i] != "#supported devices" && lines[i] != "#end of supported devices"
          && lines[i] != "") {
        device = lines[i].replace("exodus_", "");
        device = device.replace("-userdebug", "");
        devices[i] = "";
        if (checkDevice(device)) {
          devices[i] += "<b>"
        }
        var realDevice = deviceRealName(device);
        devices[i] += '<li>'; 
        realDevice.forEach(function(entry) {
          if(typeof entry !== "undefined")
            devices[i] += entry;
          else if (i == 0)
            devices[i] += device;      
        });
        devices[i] += '<br /></li>';
        if (checkDevice(device)) {
          devices[i] += "</b>"
        }
      }
    }

    devices.sort(function(a, b){
      if(a.toLowerCase() < b.toLowerCase()) return -1;
      if(a.toLowerCase() > b.toLowerCase()) return 1;
      return 0;
    });

    for (var i = 0, len = devices.length; i < len; i++) {
      devices1 += devices[i];
      if (i >= len/2 && devices0 == "") {
        devices0 = devices1;
        devices1 = "";
      }
    }

    $('#devices0').html(devices0);
    $('#devices1').html(devices1);
  });
});

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
    return ["LG ","G3"," - Tmobile"];
  if (device == "d852")
    return ["LG ","G3"," - Rogers"];
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
