/**
 * @name    jQuery Countdown Plugin
 * @author    Martin Angelov
 * @version   1.0
 * @url      http://tutorialzine.com/2011/12/countdown-jquery/
 * @license    MIT License
 */
$(function(){
  
  var note = $('#note'),
    ts = new Date(2012, 0, 1),
    newYear = true;
  
  if((new Date()) > ts) {
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    if (month < 10)
      month = '0' + month;
    var hours = dateObj.getHours();
    var day = dateObj.getUTCDate();
    if (hours < 23)
      day++;
    var year = dateObj.getUTCFullYear();
    var ts = new Date(year+"-"+month+"-"+day+" 00:00:00.00").getTime();
    newYear = false;
  }
    
  $('#countdown').countdown({
    timestamp  : ts,
    callback  : function(hours, minutes, seconds){
      
      var message = "";
      
      message += hours + " hour" + ( hours==1 ? '':'s' ) + ", ";
      message += minutes + " minute" + ( minutes==1 ? '':'s' ) + " and ";
      message += seconds + " second" + ( seconds==1 ? '':'s' ) + " <br />";
      message += "Until Next Nightly";

      note.html(message);
    }
  });
});


(function($){
  
  // Number of seconds in every time division
  var hours  = 60*60, minutes  = 60;
  
  // Creating the plugin
  $.fn.countdown = function(prop){
    
    var options = $.extend({
      callback  : function(){},
      timestamp  : 0
    },prop);
    
    var left, h, m, s, positions;

    // Initialize the plugin
    init(this, options);
    
    positions = this.find('.position');
    
    (function tick(){
      
      // Time left
      left = Math.floor((options.timestamp - (new Date())) / 1000);
      
      if(left < 0){
        left = 0;
      }
      
      // Number of hours left
      h = Math.floor(left / hours);
      updateDuo(0, 1, h);
      left -= h*hours;
      
      // Number of minutes left
      m = Math.floor(left / minutes);
      updateDuo(2, 3, m);
      left -= m*minutes;
      
      // Number of seconds left
      s = left;
      updateDuo(4, 5, s);
      
      // Calling an optional user supplied callback
      options.callback(h, m, s);
      
      // Scheduling another call of this function in 1s
      setTimeout(tick, 1000);
    })();
    
    // This function updates two digit positions at once
    function updateDuo(minor,major,value){
      switchDigit(positions.eq(minor),Math.floor(value/10)%10);
      switchDigit(positions.eq(major),value%10);
    }
    
    return this;
  };


  function init(elem, options){
    elem.addClass('countdownHolder');

    // Creating the markup inside the container
    $.each(['Hours','Minutes','Seconds'],function(i){
      $('<span class="count'+this+'">').html(
        '<span class="position">\
          <span class="digit static">0</span>\
        </span>\
        <span class="position">\
          <span class="digit static">0</span>\
        </span>'
      ).appendTo(elem);
      
      if(this!="Seconds"){
        elem.append('<span class="countDiv countDiv'+i+'"></span>');
      }
    });

  }

  // Creates an animated transition between the two numbers
  function switchDigit(position,number){
    
    var digit = position.find('.digit')
    
    if(digit.is(':animated')){
      return false;
    }
    
    if(position.data('digit') == number){
      // We are already showing this number
      return false;
    }
    
    position.data('digit', number);
    
    var replacement = $('<span>',{
      'class':'digit',
      css:{
        top:'-2.1em',
        opacity:0
      },
      html:number
    });
    
    // The .static class is added when the animation
    // completes. This makes it run smoother.
    
    digit
      .before(replacement)
      .removeClass('static')
      .animate({top:'2.5em',opacity:0},'fast',function(){
        digit.remove();
      })

    replacement
      .delay(100)
      .animate({top:0,opacity:1},'fast',function(){
        replacement.addClass('static');
      });
  }
})(jQuery);
