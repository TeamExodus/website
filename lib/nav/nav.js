jQuery(document).ready(function($){
	var secondaryNav = $('.nav-secondary-nav'),
		secondaryNavTopPosition = secondaryNav.offset().top,
		taglineOffesetTop = $('#nav-intro-tagline').offset().top + $('#nav-intro-tagline').height() + parseInt($('#nav-intro-tagline').css('paddingTop').replace('px', '')),
		contentSections = $('.nav-section');
	
	$(window).on('scroll', function(){
		//on desktop - assign a position fixed to logo and action button and move them outside the viewport
		( $(window).scrollTop() > taglineOffesetTop ) ? $('#nav-logo, .nav-btn').addClass('is-hidden') : $('#nav-logo, .nav-btn').removeClass('is-hidden');
		
		//on desktop - fix secondary navigation on scrolling
		if($(window).scrollTop() > secondaryNavTopPosition ) {
			//fix secondary navigation
			secondaryNav.addClass('is-fixed');
			//push the .nav-main-content giving it a top-margin
			$('.nav-main-content').addClass('has-top-margin');	
			//on Firefox CSS transition/animation fails when parent element changes position attribute
			//so we to change secondary navigation childrens attributes after having changed its position value
			setTimeout(function() {
	            secondaryNav.addClass('animate-children');
	            $('#nav-logo').addClass('slide-in');
				$('.nav-btn').addClass('slide-in');
	        }, 50);
		} else {
			secondaryNav.removeClass('is-fixed');
			$('.nav-main-content').removeClass('has-top-margin');
			setTimeout(function() {
	            secondaryNav.removeClass('animate-children');
	            $('#nav-logo').removeClass('slide-in');
				$('.nav-btn').removeClass('slide-in');
	        }, 50);
		}

		//on desktop - update the active link in the secondary fixed navigation
		updateSecondaryNavigation();
	});

	function updateSecondaryNavigation() {
		contentSections.each(function(){
			var actual = $(this),
				actualHeight = actual.height() + parseInt(actual.css('paddingTop').replace('px', '')) + parseInt(actual.css('paddingBottom').replace('px', '')),
				actualAnchor = secondaryNav.find('a[href="#'+actual.attr('id')+'"]');
			if ( ( actual.offset().top - secondaryNav.height() <= $(window).scrollTop() ) && ( actual.offset().top +  actualHeight - secondaryNav.height() > $(window).scrollTop() ) ) {
				actualAnchor.addClass('active');
			}else {
				actualAnchor.removeClass('active');
			}
		});
	}

});
