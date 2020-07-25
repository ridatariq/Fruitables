(function($) {	
	$.fn.navList = function() {
		var	$this = $(this);
			$a = $this.find('a'),
			b = [];
		$a.each(function() {
			var	$this = $(this),
				indent = Math.max(0, $this.parents('li').length - 1),
				href = $this.attr('href'),
				target = $this.attr('target');
			b.push(
				'<a ' +
					'class="link depth-' + indent + '"' +
					( (typeof target !== 'undefined' && target != '') ? ' target="' + target + '"' : '') +
					( (typeof href !== 'undefined' && href != '') ? ' href="' + href + '"' : '') +
				'>' +
					'<span class="indent-' + indent + '"></span>' +
					$this.text() +
				'</a>'
			);
		});
		return b.join('');
	};
	$.fn.panel = function(userConfig) {
			if (this.length == 0)
				return $this;
			if (this.length > 1) {
				for (var i=0; i < this.length; i++)
					$(this[i]).panel(userConfig);
				return $this;
			}
			var	$this = $(this),
				$body = $('body'),
				$window = $(window),
				id = $this.attr('id'),
				config;
			config = $.extend({
					delay: 0,
					hideOnClick: true,
					hideOnEscape: true,
					resetScroll: false,
					resetForms: false,
					hideOnSwipe: true,
					side: null,
					target: $this,
					visibleClass: 'visible'
			}, userConfig);
				if (typeof config.target != 'jQuery')
					config.target = $(config.target);
				$this._hide = function(event) {
						if (!config.target.hasClass(config.visibleClass))
							return;
						if (event) {
							event.preventDefault();
							event.stopPropagation();
						}
						config.target.removeClass(config.visibleClass);
						window.setTimeout(function() {
								if (config.resetScroll)
									$this.scrollTop(0);
								if (config.resetForms)
									$this.find('form').each(function() {
										this.reset();
									});
						}, config.delay);
				};
				$this
					.css('-ms-overflow-style', '-ms-autohiding-scrollbar')
					.css('-webkit-overflow-scrolling', 'touch');
				if (config.hideOnClick) {
					$this.find('a')
						.css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');
					$this
						.on('click', 'a', function(event) {
							var $a = $(this),
								href = $a.attr('href'),
								target = $a.attr('target');
							if (!href || href == '#' || href == '' || href == '#' + id)
								return;
								event.preventDefault();
								event.stopPropagation();
								$this._hide();
								window.setTimeout(function() {
									if (target == '_blank')
										window.open(href);
									else
										window.location.href = href;
								}, config.delay + 10);
						});
				}
				$this.on('click', 'a[href="#' + id + '"]', function(event) {
					event.preventDefault();
					event.stopPropagation();
					config.target.removeClass(config.visibleClass);
				});
				$body.on('click touchend', function(event) {
					$this._hide(event);
				});
				$body.on('click', 'a[href="#' + id + '"]', function(event) {
					event.preventDefault();
					event.stopPropagation();
					config.target.toggleClass(config.visibleClass);
				});
				if (config.hideOnEscape)
					$window.on('keydown', function(event) {
						if (event.keyCode == 27)
							$this._hide(event);
					});
		return $this;
	};
	$.fn.placeholder = function() {
			if (typeof (document.createElement('input')).placeholder != 'undefined')
				return $(this);
			if (this.length == 0)
				return $this;
			if (this.length > 1) {
				for (var i=0; i < this.length; i++)
					$(this[i]).placeholder();
				return $this;
			}
			var $this = $(this);
	};
	$.prioritize = function($elements, condition) {
		var key = '__prioritize';
			if (typeof $elements != 'jQuery')
				$elements = $($elements);
			$elements.each(function() {
				var	$e = $(this), $p,
					$parent = $e.parent();
					if ($parent.length == 0)
						return;
					if (!$e.data(key)) {
							if (!condition)
								return;
							$p = $e.prev();
								if ($p.length == 0)
									return;
							$e.prependTo($parent);
							$e.data(key, $p);
					}
					else {
							if (condition)
								return;
						$p = $e.data(key);
							$e.insertAfter($p);
							$e.removeData(key);
					}
			});
	};
})(jQuery);