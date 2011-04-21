$(function() {
	$.support.transform = Modernizr.csstransforms3d ? '3d' : Modernizr.csstransforms ? '2d' : false;
	
	// Hack pour lisser les bords des images en CSS 3D
	if ($.support.transform === '3d') {
		var el = document.getElementsByTagName('a')[0];
		el.focus();
		el.blur();
	}

	if ($.support.transform) {
		$.cssHooks.transform = {
			set: function(elem, value) {
				var div = document.createElement('div'),
					property = div.style.transform === '' ? 'transform' :
				(div.style.WebkitTransform === '' ? 'WebkitTransform' :
				(div.style.MozTransform === '' ? 'MozTransform' :
				(div.style.OTransform === '' ? 'OTransform' :
				(div.style.Transform === '' ? 'transform' :
				false))));
				
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

			$slide.css({
				zIndex: 9001,
				transform: 'none'
			});

			for (var i = 0; i < $('.slide').length; i++) {
				if (i > 0) {
					var zIndex = 9001 - i,
						transform = $.support.transform === '3d' ?
							'translate3d(' + parseInt(150 + i * 60, 10) + 'px, 0px, ' + parseInt(-i * 120 - 100, 10) + 'px)  rotateY(-15deg)' :
							'translate(' + parseInt(290 + i * 50, 10) + 'px, 0px)  scale(' + parseFloat(.9-(i/20)) + ')';
					$slide.css({
						zIndex: zIndex,
						transform: transform
					});
				}
				$slide = $slide.next().length ? $slide.next() : $('.slide:first');
			}
		}).trigger('slide', $('.slide:first'));
		
		function slideLoop() {
			slideLoopTimeout = setTimeout( function() {
				$slides.trigger('slide');
				slideLoop();
			}, 3000);
		}
		slideLoop();
		
		function resetTimeout() {
			clearTimeout(slideLoopTimeout);
			slideLoop();
		}

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
		
		//
		$(document).keydown(function(e) {
			var keyCode = e.keyCode;
			if ($.inArray(keyCode, [37, 39]) !== -1) {
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
						case 37: // Gauche
							var $next = $focus.prev().length ? $focus.prev() : $('.slide:last');
							break;
						case 39: // Droite
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
		});
	} else {
		alert('wat ?!?');
	}
});