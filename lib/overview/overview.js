jQuery(document).ready(function($){
  //open interest point description
  $('.overview-single-point').children('a').on('click', function(){
    var selectedPoint = $(this).parent('li');
    if( selectedPoint.hasClass('is-open') ) {
      selectedPoint.removeClass('is-open').addClass('visited');
    } else {
      selectedPoint.addClass('is-open').siblings('.overview-single-point.is-open').removeClass('is-open').addClass('visited');
    }
  });
  //close interest point description
  $('.overview-close-info').on('click', function(event){
    event.preventDefault();
    $(this).parents('.overview-single-point').eq(0).removeClass('is-open').addClass('visited');
  });

  //on desktop, switch from product intro div to product mockup div
  $('#overview-start').on('click', function(event){
    event.preventDefault();
    //detect the CSS media query using .overview-product-intro::before content value
    var mq = window.getComputedStyle(document.querySelector('.overview-product-intro'), '::before').getPropertyValue('content').replace(/"/g, "").replace(/'/g, "");
    if(mq == 'mobile') {
      $('body,html').animate({'scrollTop': $($(this).attr('href')).offset().top }, 200); 
    } else {
      $('.overview-product').addClass('is-product-tour').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
        $('.overview-close-product-tour').addClass('is-visible');
        $('.overview-points-container').addClass('points-enlarged').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
          $(this).addClass('points-pulsing');
        });
      });
    }
  });
  //on desktop, switch from product mockup div to product intro div
  $('.overview-close-product-tour').on('click', function(){
    $('.overview-product').removeClass('is-product-tour');
    $('.overview-close-product-tour').removeClass('is-visible');
    $('.overview-points-container').removeClass('points-enlarged points-pulsing');
  });
});
