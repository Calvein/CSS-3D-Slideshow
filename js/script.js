$(function() {
	$.support.transform = Modernizr.csstransforms3d ? '3d' : Modernizr.csstransforms ? '2d' : false;
	
	// Hack pour lisser les bords des images en CSS 3D
	if ($.support.transform === '3d') {
		var $fakeA = $('<a href="#"></a>').appendTo('body').focus().blur();
		$(window).one('mouseover', function() {
			$fakeA.focus().blur().remove();
		});
	}
	
	$.cssHooks.transform = {
		set: function(elem, value) {
			var div = document.createElement('div'),
				property = div.style.transform === '' ? 'transform' :
			(div.style.WebkitTransform === '' ? 'WebkitTransform' :
			(div.style.MozTransform === '' ? 'MozTransform' :
			(div.style.MsTransform === '' ? 'MsTransform' :
			(div.style.OTransform === '' ? 'OTransform' :
			(div.style.Transform === '' ? 'transform' :
			false)))));
			
			elem.style[property] = value;
		}
	};

	var $slides = $('#slides'),
		slideLoopTimeout = null;
		
	$slides.bind('slide', function(e, next) {
		var $slide = $('.active'),
			$next = next ? $(next) : 
					$slide.next().length ? $slide.next() : $('.slide:first');

		$slide.removeClass('active');
		$next.addClass('active');
		$slide = $next;

		for (var i = 0, len = $('.slide').length; i < len; i++) {
			var zIndex = 9001 - i;
			if ($.support.transform) {
				if (i === 0) {
					$slide.css({
						zIndex: 9001,
						transform: 'none'
					});
				} else {
					$slide.css({
						zIndex: zIndex,
						transform: $.support.transform === '3d' ?
							'translate3d(' + parseInt(150 + i * 60, 10) + 'px, 0px, ' + parseInt(-i * 120 - 100, 10) + 'px)  rotateY(-15deg)' :
							// @TODO Revoir le scale
							'translate(' + parseInt(290 + i * 50, 10) + 'px, 0px)  scale(' + parseFloat(.9-(i/20)) + ')'
					});
				}
			} else {
				if (i === 0) {
					$slide.css('zIndex', 9001);
					$slide.animate({
						left: 0,
						width: 460
					});
				} else {
					$slide.css('zIndex', 9001-i);
					$slide.animate({
						top: i * 10 + 20,
						left: 320 + i * 60,
						// @TODO Revoir le width
						width: 460*parseFloat(.9-(i/20))
					}, 700);
				}
			}
			$slide = $slide.next().length ? $slide.next() : $('.slide:first');
		}
	}).find('img').load(function() {
		$(this).parents('.slide').removeClass('invisible');
		$slides.trigger('slide');
	});
	
	// Loop toutes les 3 secondes
	function slideLoop() {
		slideLoopTimeout = setTimeout( function() {
			$slides.trigger('slide');
			slideLoop();
		}, 3000);
	}	
	function resetTimeout() {
		clearTimeout(slideLoopTimeout);
		slideLoop();
	}
	slideLoop();

	// Click sur les slides
	$('.slide a').click( function(e) {
		e.preventDefault();
		var $this = $(this);
		if ($this.parent().hasClass('active'))
			alert('Ouvre ' + this.href.split('#')[1]);
		$slides.trigger('slide', $this.parent());
		resetTimeout();
	});
	
	
	// Click sur la flêche
	$('button').click( function(e) {
		$slides.trigger('slide');
		resetTimeout();
	});
	
	if (Modernizr.touch && false) {
		// @TODO mettre seulement le code pour swipeleft/right, le code là marche mais c'est pas optimisé
		$.getScript('http://code.jquery.com/mobile/1.0a4.1/jquery.mobile-1.0a4.1.min.js', function() {
			$slides.live('swipeleft', {swipe: 'left'}, swipeSlide);
			$slides.live('swiperight', {swipe: 'right'}, swipeSlide);
		});
	}
	
	$(document).keydown(swipeSlide);		
	function swipeSlide(e) {
		var LEFT = 37,
			RIGHT = 39,
			keyCode = e.keyCode ? e.keyCode :
		(e.data.swipe === 'left' ? LEFT :
		(e.data.swipe === 'right' ? RIGHT :
		false));
		
		if (keyCode === LEFT || keyCode === RIGHT) {
			var $slideFocus = $('.slide a:focus');
			if ($slideFocus.length) {
				var $focus =  $('.slide a:focus').parent(),
					isFocused = true;
			} else {
				var $focus =  $('.active'),
					isFocused = false;
			}
			
			if (isFocused || $slides.is(':hover')) {
				switch (keyCode) {
					case LEFT:
						var $next = $focus.prev().length ? $focus.prev() : $('.slide:last');
						break;
					case RIGHT:
						var $next = $focus.next().length ? $focus.next() : $('.slide:first');
						break;
				}
				if (isFocused) {
					$slideFocus.blur();
					$next.find('a').focus();
				}
				$slides.trigger('slide', $next);
				resetTimeout();
			}
		}
	}
});