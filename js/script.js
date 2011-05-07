$(function() {	
	// Useless
	if (Modernizr.canvas) {
		$.getScript('https://github.com/desandro/close-pixelate/raw/master/close-pixelate.js', function() {
			var $logo = $('.logo'),
				img = document.getElementsByTagName('img')[0],
				after = '<img src="'+ img.src +'">';
			img.closePixelate([{ resolution : 6 }]);

			$logo
				.append(after)
				.hover(function() {
				$logo.find('canvas').toggle();
				$logo.find('img').toggle();	
			}, function() {
				$logo.find('canvas').toggle();
				$logo.find('img').toggle();
			});
		});
	}
	
	// Check if the browser support csstransforms[3d]
	$.support.transform = Modernizr.csstransforms3d ? '3d' : Modernizr.csstransforms ? '2d' : false;
	
	// Hack to make the 3D images smoother
	if ($.support.transform === '3d') {
		var $fakeA = $('<a href="#"></a>').appendTo('body').focus().blur();
		$(window).one('mouseover', function() {
			$fakeA.focus().blur().remove();
		});
	}
	
	// CSS Hook for AAAAAALLLLLLLLLLLL the transform
	$.cssHooks.transform = {
		set: function(elem, value) {
			var div = document.createElement('div'),
				property = div.style.transform === '' ? 'transform' :
			(div.style.WebkitTransform === '' ? 'WebkitTransform' :
			(div.style.MozTransform === '' ? 'MozTransform' :
			(div.style.MsTransform === '' ? 'MsTransform' :
			(div.style.OTransform === '' ? 'OTransform' :
			false))));
			
			elem.style[property] = value;
		}
	};

	var $slides = $('#slides'),
		slideLoopTimeout = null;
		
	// The sliding event on the #slides container
	$slides.bind('slide', function(e, next) {
		var $slide = $('.active'),
			$next = next ? $(next) : 
					$slide.next().length ? $slide.next() : $('.slide:first');

		$slide.removeClass('active');
		$next.addClass('active');
		$slide = $next;

		for (var i = 0, len = $('.slide').length; i < len; i++) {
			var zIndex = 9001 - i;
			if ($.support.transform && Modernizr.csstransitions) {
				if (i === 0) {
					$slide.css({
						zIndex: 9001,
						transform: 'none'
					});
				} else {
					$slide.css({
						zIndex: zIndex,
						transform: transform = $.support.transform === '3d' ?
						'translate3d(' + parseInt(150 + i * 60, 10) + 'px, 0px, ' + parseInt(-i * 120 - 100, 10) + 'px)  rotateY(-15deg)' :
						'translate(' + parseInt(300 + i * 50, 10) + 'px, 0px)  scale(' + parseFloat(.9-(i/20)) + ')'
					});
				}
			} else {
				var duration = 700;
				if (i === 0) {
					$slide.css('zIndex', 9001);
					$slide.stop().animate({
						left: 0,
						top: 0,
						width: 460
					}, duration, function() {
						
					});
				} else {
					$slide.css('zIndex', zIndex);
					$slide.stop().animate({
						top: i * 10 + 20,
						left: 325 + i * 60,
						width: 460 * parseFloat(.9-(i/20))
					}, duration);
				}
			}
			$slide = $slide.next().length ? $slide.next() : $('.slide:first');
		}
	}).find('img').each(function(i) {
		$(this).load(function() {
			if (i === $slides.find('img').length-1) {
				$('.slide').removeClass('invisible');
				$slides.trigger('slide', $('.slide:first'));
			}
		});
	});
	
	// Loop every 3 seconds
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

	// Click on slides
	$('.slide a').click( function(e) {
		e.preventDefault();
		var $this = $(this);
		if ($this.parent().hasClass('active'))
			alert('Ouvre ' + this.href.split('#')[1]);
		$slides.trigger('slide', $this.parent());
		resetTimeout();
	});
	
	
	// Click on the arrow
	$('button').click( function(e) {
		$slides.trigger('slide');
		resetTimeout();
	});
	
	
	// Slide function, with arrows or touch/mouse movement
	function swipeSlide(e, direction) {
		var LEFT = 37,
			RIGHT = 39,
			keyCode = e ? e.keyCode :
		(direction === 'left' ? LEFT :
		(direction === 'right' ? RIGHT :
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
	
	// Prevent the drag on the slides' anchors
	$slides.find('a').bind('dragstart', function(e) {
		e.preventDefault();
	});
	
	$(document).keydown(swipeSlide);
	
	/**
	 * Swipe events, based on jquery.mobile.event.js
	 * https://github.com/jquery/jquery-mobile/blob/master/js/jquery.mobile.event.js
	 */
	var touchStartEvent = Modernizr.touch ? 'touchstart' : 'mousedown',
		touchStopEvent = Modernizr.touch ? 'touchend' : 'mouseup',
		touchMoveEvent = Modernizr.touch ? 'touchmove' : 'mousemove';
	
	$slides.bind(touchStartEvent, function(e) {
		var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
		start = {
			time: (new Date).getTime(),
			coords: [data.pageX, data.pageY]
		},
		stop;

		function moveHandler(e) {
			if (!start)
				return;

			var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
			stop = {
				time: (new Date).getTime(),
				coords: [ data.pageX, data.pageY ]
			};

			// Prevent scrolling
			if (Math.abs( start.coords[0] - stop.coords[0] ) > 10) {
				e.preventDefault();
			}
		}

		$slides
		.bind(touchMoveEvent, moveHandler)
		.one(touchStopEvent, function(e) {
			$slides.unbind( touchMoveEvent, moveHandler);
			if (start && stop) {
				if (stop.time - start.time < 1000 &&
				Math.abs( start.coords[0] - stop.coords[0]) > 30 &&
				Math.abs( start.coords[1] - stop.coords[1]) < 75) {
					swipeSlide(false, start.coords[0] > stop.coords[0] ? 'right' : 'left');
				}
			}
			start = stop = undefined;
		});
	});
});