/*
---
Kemso More Extensions

copyrights:
  - [Kemso](http://kemso.com)

licenses:
  - You may not under any circumstances copy, redistribute, or re-sell this code, 
  	or use it as the basis for another site or application.
  - You may modify this code for the purposes of modifying a single insillation of the 
  	purchased product which which this code was distributed
  - http://whiteloupe.com/license.txt
...
*/



/*
---
MooTools: Kemso extensions

/*
---

name: Kemso

description: Mootools additions by Kemso

license: MIT-style license.

authors: Kemso, LLC (http://www.kemso.com)

provides: [Kemso]

...
*/

(function(){

this.Kemso = {
	version: '1.3'
};

// trace




var osmek_photo_id = this.osmek_photo_id = function(src)
{
	var url = typeOf(src) == 'element' ? (src.get('data-src') || src.get('src')) : src;
	var id = url.substr(url.lastIndexOf('/')+1).split('.')[0];
	return id;
}

var osmek_photo_url = this.osmek_photo_url = function(src, size)
{
	if(typeOf(size) == 'null') size = '';
	
	var url = 'http://photos.osmek.com/'+osmek_photo_id(src);
	if(size) url += '.'+size;
	
	return url;
}
var osmek_photo_info = this.osmek_photo_info = function(src)
{
	var url = typeOf(src) == 'element' ? (src.get('data-src') || src.get('src')) : src;
	var data = url.substr(url.lastIndexOf('/')+1).split('.');
	var info = {};
		info.id = data[0];
		info.size = data.length > 1 ? data[1] : 0;
		info.type = data.length > 2 ? data[2] : false;
	var size_parts = info.size.split('x');
	if(size_parts.length > 1)
	{
		info.width = size_parts[0];
		info.height = size_parts[1];
		info.crop = size_parts.length > 2 ? size_parts[2] : 0;
	}
	return info;
}


// Alternate - adds even/odd classes to a collection of elements

var alternate = this.alternate = function(alternations){
	for(var i = 0, l = alternations.length; i < l; i++){
		var obj = document.id(alternations[i]);
		if(obj.getStyle('display') == 'none') continue;
		if (i % 2 == 0) obj.removeClass('even').addClass('odd');
		else obj.removeClass('odd').addClass('even');
	}
};


// Return stored class reference
var $C = this.$C = function(el){ 
	
	if( ! el) return false;
	
	el = document.id(el);
	
	if( ! el.retrieve('ClassRef') && el.get('data-dom-class'))
	{
		var subject = el.get('data-dom-class');
		var patt = /([a-zA-Z\.0-9-_]+)(\[.*\])?/gi;
		var matches = patt.exec(subject);
		
		var class_tree = matches[1];
		var arguments = typeOf(matches[2]) == 'string' ? eval(matches[2]) : matches[2];
		if(arguments)
		{
			for(var i=0, l=arguments.length; i < l; i++)
			{
				if(arguments[i] == 'el') arguments[i] = el;
			}
		}
		else
		{
			arguments = [el];
		}
				
		var c = class_tree.split('.');
		var o = window;
		for(var i = 0, l = c.length; i < l - 1; i++)
		{
			if(typeOf(o[c[i]]) != 'null')
			{
				o = o[c[i]];
			}
			else
			{
				console.log('Class '+class_tree+' can\'t be found');
				return false;
			}
		}
		
		var namespace = c.join('0');
		var m = c.pop();		

		if(typeOf(o[m]) != 'null')
		{
			if(typeOf(window[namespace]) == 'null')
			{
				window[namespace] = new Class({
					Extends: o[m],
					initialize: function()
					{
						var args = typeOf(arguments[0]) == 'array' ? arguments[0] : arguments;
						this.parent.apply(this, args);
					}
				});
			}
			
			var i = new window[namespace](arguments);
			el.store('ClassRef', i);
		}
		else
		{
			console.log('Class '+class_tree+' can\'t be found');
			return false;
		}
	}
	
	return el.retrieve('ClassRef');
};

var make_dom_classes = this.make_dom_classes = function(){
	
	/*
	*	Create dom element classes
	*/
	$$('*[data-dom-class]').each(function(el){
		$C(el);
	});	
	
};


})();


var inline_elements = ['span', 'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'cite', 'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'q', 'samp', 'select', 'small', 'strong', 'sub', 'sup', 'textarea', 'tt', 'var'];



/* Add to the Element Class */
Element.implement({

	getIndex: function(selector){
		var parent = this.getParent();
		if( ! parent) return 0;
		var children = parent.getChildren(selector);
		for(var i = 0, l = children.length; i < l; i++) if(children[i] == this) return i;
		return 0;
	},
	
	off: function(){
		if( ! this.retrieve('init_display_state') && this.getStyle('display') != 'none') this.store('init_display_state', this.getStyle('display'));
		this.setStyle('display', 'none');
		return this;
	},
	
	on: function(options){
		if( ! this.retrieve('init_display_state')){
			if(this.getStyle('display') != 'none') this.store('init_display_state', this.getStyle('display'));
			else this.store('init_display_state', inline_elements.contains(this.get('tag').toLowerCase()) ? 'inline' : 'block');
		}
		this.setStyles(Object.merge({
			opacity: this.getStyle('opacity') == 0 ? 1 : this.getStyle('opacity'),
			visibility: this.getStyle('visibility') == 'hidden' ? 'visible' : this.getStyle('visibility'),
			display: this.retrieve('init_display_state')
		}, options));
		return this;
	},
	
	toggle: function(){
		if(this.getStyle('display') != 'none') this.off(); else this.on();
		return this;
	},
	
	fadeOut: function(opts){
		options = Object.merge({ duration: 200, delay: 0, onComplete: function(){} }, opts);
		this.set('morph', {duration: options.duration, transition: Fx.Transitions.Quint.easeOut}).morph({opacity: 0});
		this.get('morph').addEvent('complete', options.onComplete).addEvent('complete', function(){
			$(this).setStyles({'visibility': 'visible', 'display': 'none', 'opacity': 1});
		}.bind(this));
		return this;
	},
	
	kill: function(opts){
		opts = Object.merge({ property: 'opacity', duration: 300 }, opts);
		var fx = new Fx.Tween(this, opts);
		fx.addEvent('complete', function(){ if(this) this.destroy(); }.bind(this));
		//if(opts.onComplete) fx.addEvent('complete', function(){ opts.onComplete(); });
		fx.start(0);
		return this;
	}
});


Elements.implement({
	off: function(){
		this.each(function(el){ el.off(); });
	},
	on: function(options){
		this.each(function(el){ el.on(options); });
	}
});


/*
---
description: Added the onhashchange event

license: MIT-style

authors: 
- sdf1981cgn
- Greggory Hernandez

requires: 
- core/1.2.4: '*'

provides: [Element.Events.hashchange]

...
*/
Element.Events.hashchange = {
    onAdd: function(){
        var hash = self.location.hash;

        var hashchange = function(){
            if (hash == self.location.hash) return;
            else hash = self.location.hash;

            var value = (hash.indexOf('#') == 0 ? hash.substr(1) : hash);
            value = (value.indexOf('!') == 0 ? value.substr(1) : value);
            value = (value.substr(0, 1) == '/' ? value.substr(1) : value);
            window.fireEvent('hashchange', value);
            document.fireEvent('hashchange', value);
        };

        if ("onhashchange" in window){
            window.onhashchange = hashchange;
        } else {
            hashchange.periodical(50);
        }
    }
};

function location_hash(hash)
{
	if(typeOf(hash) == 'number') return location_hash_segment(hash);
	if(typeof(hash) != 'undefined') window.location.hash = '!/'+hash;
	var val = window.location.hash.length > 1 ? window.location.hash.substr(1) : '';
	val = (val.indexOf('!') == 0 ? val.substr(1) : val);
	if(val.substr(0, 1) == '/') val = val.substr(1);
	return val;
}

function location_hash_segment(num)
{
	var hash = location_hash();
	if(hash.substr(0, 1) == '/') hash = hash.substr(1);
	if(hash.substr(-1) == '/') hash = hash.substr(0, hash.length - 1); // Don't think this works in IE
	
	var parts = hash.split('/');
	if(typeOf(parts[num]) == 'null') return false;
	return parts[num];
}


var LocationHash = new Class({
	
	Implements: [Options, Events],
	
	options: {
		seperator: '/',
		schema: [],
		listen_only: false,
		events: {}
	},
	
	parts: [],
	
	initialize: function(options)
	{
		this.setOptions(options);
		this.addEvents(this.options.events);
		
		this.fire_change = true;
		window.addEvent('hashchange', this.onChange.bind(this));
		
        this.parts = location_hash().split(this.options.seperator);
        
		//if(this.parts) this.onChange(location_hash());
	},
	
	onChange: function(value)
	{
		var oldparts = this.parts;
		var changes = [];
		this.parts = value.split(this.options.seperator);
		
		this.parts.each(function(item, key){
			if(item != oldparts[key]) changes.push(true); else changes.push(false);
		});
		
		if( ! this.fire_change)
		{
			this.fire_change = true;
		}
		else
		{
			this.fireEvent('change', [this.get(), this.parts, oldparts, changes]);
		}
	},
	
	set: function()
	{
		var hash = [];
		
		// Pass an object to change only specific parts of the hash
		if(typeOf(arguments[0]) == 'object')
		{
			hash = Array.clone(this.parts);
			for(var i in arguments[0]) hash.splice(i, 1, arguments[0][i]);
		}
		
		// Pass an array
		else if(typeOf(arguments[0]) == 'array')
		{
			hash = arguments[0];
		}
		
		// Parts as arguments
		else
		{
			for(var i = 0, l = arguments.length; i < l; i++) hash.push(arguments[i]);
		}
		
		hash = hash.join(this.options.seperator);
		
		// If we're we're in listen only mode AND the hash is different, don't fire change.
		if(this.options.listen_only && location_hash() != hash) this.fire_change = false;
		
		location_hash(hash);
	},
	
	
	get: function()
	{
		if(this.options.schema)
		{
			var schema = {arguments: false};
			this.options.schema.each(function(name, key){
				schema[name] = this.parts[key];
			}.bind(this));
			
			if(this.parts.length > this.options.schema.length) schema.arguments = this.parts.slice(this.options.schema.length);
			
			return schema;
		}
		else
		{
			return this.parts;
		}
	},
	
	
	schema: function()
	{
		this.options.schema = arguments;
		return this;
	}
	
});




/*
---
 
name: Kemso.Scrollbar
description: A MooTools Overflow scrollbar class

version: 1.0
copyright: Kemso, LLC (http://kemso.com)
license: MIT License
authors:
- Matt McCloskey

requires: [MooTools Core, More/Drag]

provides: Kemso.ScrollBar
 
...
*/


/* Implement a new Set method of Fx to fire an update event for the scroll bar */
Fx.implement({
	step: function(now){
		if (this.options.frameSkip){
			var diff = (this.time != null) ? (now - this.time) : 0, frames = diff / this.frameInterval;
			this.time = now;
			this.frame += frames;
		} else {
			this.frame++;
		}
		
		if (this.frame < this.frames){
			var delta = this.transition(this.frame / this.frames);
			this.set(this.compute(this.from, this.to, delta));
			this.fireEvent('update');
		} else {
			this.frame = this.frames;
			this.set(this.compute(this.from, this.to, 1));
			this.stop();
		}
	},
});


/* Create a scroll bar from existing elements */
Kemso.ScrollBar = new Class({
	
	Implements: [Options, Events],

	options: {
		axis: 'y',
		trackClick: true,
		wheel: true,
		wheelSensitivity: 4,
		minHandleSize: 30,
		autoResize: true,
		events: {}
	},

	initialize: function(content, track, handle, options){
		this.setOptions(options);
		
		if(Browser.firefox) this.options.wheelSensitivity = .5;
		if(Browser.chrome) this.options.wheelSensitivity = .1;
		if(Browser.safari && Browser.version >= 5) this.options.wheelSensitivity = .1;
		
		this.addEvents(this.options.events);
		
		/* Elements */
		this.content = document.id(content);
		this.control = false;
		if(typeOf(track) != 'null' && track) this.control = new Kemso.ScrollBar.Track(handle, track, this.options).addEvents({
			'move': this.setScroll.bind(this)
		});
		
		this.has_scroll = false;
		this.scroll_pos = {x:0, y:0};
		this.wheel_last_value = 0;
		this.wheel_speed = 0;
			
		this.resize();		
		
		if(this.options.wheel)
		{
			this.content.addEvent('mousewheel', this.mousewheel.bind(this));
			if(this.control) this.control.track.addEvent('mousewheel', this.mousewheel.bind(this));
		}
				
		// Autoresize with window
		if(this.options.autoResize) window.addEvent('resize', this.resize.bind(this));
		
		// Is it an iPad?
		// Scroll Effect
		var desktop_touch = false; //Browser.safari;
		if(typeOf(Touch.Scroll) != 'null' && (desktop_touch || Browser.Platform.ios || Browser.Platform.android || Browser.Platform.webos))
		{
			// There has to be a wrapper around the content here for touch scroll to work.
			if(this.content.getChildren().length > 1)
			{
				var wrap = new Element('div', {'class': 'scroll-container-wrapper'});
				this.content.getChildren().each(function(el){
					el.inject(wrap);
				});
				wrap.inject(this.content);
			}
			
			this.touch_scroll = new Touch.Scroll(this.content, {
				desktopCompatibility: desktop_touch,
				direction: this.options.axis == 'x' ? 'horizontal' : 'vertical',
				snap: false,
				momentum: true,
				vScrollbar: false,
				hScrollbar: false,
				events: {
					'scroll': function(pos){
						pos.x = -pos.x;
						pos.y = -pos.y;
						this.scroll_pos = {
							x: pos.x / (this.content.getScrollSize().x - this.content.getSize().x),
							y: pos.y / (this.content.getScrollSize().y - this.content.getSize().y)
						};
						if(this.control) this.control.move(this.scroll_pos.x, this.scroll_pos.y);
					}.bind(this)
				}
			});
		}

	},
	
	// --------------------------------------------------------------------
		
	/**
	 * Set scroll by percentage object
	 * 
	 */
	setScroll: function(pos)
	{
		this.scroll_pos = pos;
		this.scrollTo(
			this.scroll_pos.x * (this.content.getScrollSize().x - this.content.getSize().x),
			this.scroll_pos.y * (this.content.getScrollSize().y - this.content.getSize().y),
			false
		);
	},
	
	
	// --------------------------------------------------------------------
		
	/**
	 * Update scroll pos and track position
	 * 
	 */
	update: function()
	{
		this.scroll_pos = {
			x: this.content.getScroll().x / (this.content.getScrollSize().x - this.content.getSize().x),
			y: this.content.getScroll().y / (this.content.getScrollSize().y - this.content.getSize().y)
		};
		if(this.control) this.control.move(this.scroll_pos.x, this.scroll_pos.y);
	},
	
	
	// --------------------------------------------------------------------
		
	/**
	 * Set scroll by x & y values.
	 * 
	 */
	scrollTo: function(x, y, animate)
	{
		if(typeOf(this.watch_timeout) == 'null' || this.watch_timeout === false){
			this.fireEvent('start');
			this.v_change = 0;
			this.h_change = 0;
			clearTimeout(this.watch_timeout);
		}else{
			this.fireEvent('scroll');
			clearTimeout(this.watch_timeout);
		}
		this.watch_timeout = setTimeout(function(){
			this.fireEvent('end');
			this.watch_timeout = false;
		}.bind(this), 100);
		
		//trace('scrollTo: '+x+', '+y);
		if( ! this.has_scroll) return false;
		
		if(typeOf(animate) == 'null') animate = true;
		var scroll_size = this.content.getScrollSize();
		var content_size = this.content.getSize();
		x = this.options.axis == 'x' ? Math.max(0, Math.min(x || this.content.getScroll().x, scroll_size.x - content_size.x)) : 0;
		y = this.options.axis == 'y' ? Math.max(0, Math.min(y || this.content.getScroll().y, scroll_size.y - content_size.y)) : 0;
		
		if(animate)
		{
			new Fx.Scroll(this.content, {duration: 500, transition: 'sine:in:out'}).addEvent('update', this.update.bind(this)).start(x, y);
		}
		else
		{
			this.content.scrollTo(x, y);
			
			this.scroll_pos = {
				x: this.content.getScroll().x / (this.content.getScrollSize().x - this.content.getSize().x),
				y: this.content.getScroll().y / (this.content.getScrollSize().y - this.content.getSize().y)
			};
			if(this.control) this.control.move(this.scroll_pos.x, this.scroll_pos.y);
			//trace(this.scroll_pos.x+', '+this.scroll_pos.y);
		}
	},
	
	set: function(x,y)
	{
		this.scrollTo(x,y,false);
	},
	
	
	// --------------------------------------------------------------------
		
	/**
	 * Handle mousewheel event
	 * 
	 */
	mousewheel: function(event){
		
		if(this.has_scroll){
		
			// Add X & Y values to event if possible
			event.wheelX = (typeOf(event.event.wheelDeltaX) == 'number') ? event.event.wheelDeltaX / 120 : false;
			event.wheelY = (typeOf(event.event.wheelDeltaY) == 'number') ? event.event.wheelDeltaY / 120 : false;
			if(Browser.firefox){
				var ff_diviser = 3;
				if (typeOf(event.event.axis) && event.event.axis == event.event.HORIZONTAL_AXIS){
	                // FF can only scroll one dirction at a time
	                event.wheelX = (-event.event.detail/ff_diviser) * Math.max(1, Math.abs(((event.event.detail/ff_diviser)/1.2)));
	                event.wheelY = false;
	            }else {
	            	event.wheelX = false;
	            	event.wheelY = (-event.event.detail/ff_diviser) * Math.max(1, Math.abs(((event.event.detail/ff_diviser)/1.2)));
	            } 
			}
			
			// Only use mouse wheel if the scroll is in the same direction as our axis (or if we can't tell direction)
			if(
				(this.options.axis == 'x' && event.wheelX) || 
				(this.options.axis == 'y' && event.wheelY) || 
				( ! event.wheelX && ! event.wheelY)
			)
			{
				var wheel = (this.options.axis == 'x' && event.wheelX) ? event.wheelX : ((this.options.axis == 'y' && event.wheelY) ? event.wheelY : event.wheel);
				
				//trace(wheel);
				
				// If we're getting data in both directions, try to calculate the change.
				if(event.wheelX && event.wheelY)
				{
					if(typeOf(this.v_change) == 'null') this.v_change = 0;
					if(typeOf(this.h_change) == 'null') this.h_change = 0;
					this.v_change += Math.abs(event.wheelY);
					this.h_change += Math.abs(event.wheelX);
					var dir = this.v_change > this.h_change ? 'y' : 'x';
					if(dir != this.options.axis) return;
				}
				
				// Only move if there's room left to scroll in the current scroll direction
				if((this.scroll_pos[this.options.axis] > 0 && this.scroll_pos[this.options.axis] < 1) || (wheel < 0 /* down */ && this.scroll_pos[this.options.axis] == 0) || (wheel > 0 /* up */ && this.scroll_pos[this.options.axis] == 1)){
					
					// Stop default window scroll
					event.stop();
					event.preventDefault();
					
					// Wheel speed
					/*
if(this.wheel_last_value){
						this.wheel_speed = wheel - this.wheel_last_value;
					} else {
						this.wheel_speed = 0;
					}
					this.wheel_last_value = wheel;
*/					
					var sensitivity = this.options.wheelSensitivity;
					//if(this.wheel_speed < 2 && sensitivity > 1) sensitivity = 1;
					//sensitivity = Math.abs(event.wheel) > sensitivity ? sensitivity : 1;
					var cur_scroll = this.content.getScroll();
					this.scrollTo(cur_scroll.x - (wheel/sensitivity), cur_scroll.y - (wheel/sensitivity), false);
					if(this.control) this.control.move(this.scroll_pos.x, this.scroll_pos.y);
				}
			}
		}
	},
	
	
	
	// --------------------------------------------------------------------
		
	/**
	 * Resize
	 * 
	 */
	resize: function()
	{
		if(this.content.getScrollSize()[this.options.axis] > this.content.getSize()[this.options.axis]){
			if(this.control) this.control.on();
			this.content.addClass('has-bar');
			this.has_scroll = true;
		}else{
			if(this.control) this.control.off();
			this.content.removeClass('has-bar');
			this.has_scroll = false;
		}
		if(this.control) this.control.resize(this.content.getSize()[this.options.axis] / this.content.getScrollSize()[this.options.axis]);
	}
});


/* Handle the scroll bar */
Kemso.ScrollBar.Track = new Class({

	Implements: [Options, Events],
	
	options: {
		axis: 'y',
		minHandleSize: 30
	},
	
	initialize: function(handle, track, options)
	{
		this.setOptions(options);
		this.handle = document.id(handle);
		this.track = document.id(track);
		this.handle_init = this.handle.getPosition(this.track);
		this.position = {x:0, y:0};
		this.resize();
		
		this.handle.setStyles({'position': 'absolute', 'left': this.handle_limit.left, 'top': this.handle_limit.top});
		
		this.drag = new Drag(this.handle, {
			preventDefault: true,
			snap: 0,
			limit: {
				x: [this.handle_limit.left, this.handle_limit.right], 
				y: [this.handle_limit.top, this.handle_limit.bottom]
			}
		}).addEvents({
			'drag': function(el, e){
				this.fireEvent('move', [this.getPosition()]);
			}.bind(this)
		});
		
		this.handle.addEvent('click', function(e){ e.stop(); });
		//this.handle.set('tween', {duration: 300, transition: 'sine:in:out'}).get('tween').addEvent('update', this.update.bind(this));
		
		if(this.options.trackClick){
			this.track.addEvent('click', function(e){
				var mouse = {x: e.page.x - this.track.getPosition().x, y: e.page.y - this.track.getPosition().y};
				var change = {x: this.handle.getSize().x, y: this.handle.getSize().y};
				if(mouse.x < this.handle.getPosition(this.track).x) change.x = -change.x;
				if(mouse.y > this.handle.getPosition(this.track).y) change.y = -change.y;
				//trace('trackClick');
			}.bind(this));
		}
	},
	
	/* Return an object with percentage x & y values for position of the handle */
	getPosition: function()
	{
		this.position = {
			x: (this.handle.getPosition(this.track).x - (this.handle_limit.left)) / (this.track.getSize().x - (this.handle_limit.left * 2) - this.handle.getSize().x),
			y: (this.handle.getPosition(this.track).y - (this.handle_limit.top)) / (this.track.getSize().y - (this.handle_limit.top * 2) - this.handle.getSize().y)
		};
		
		return this.position;
	},
	
	/* Move handle by a percentage */
	move: function(perc_x, perc_y)
	{
		this.handle.setStyles({
			'left': this.handle_limit.left + (perc_x * (this.track.getSize().x - this.handle.getSize().x - (this.handle_limit.left * 2))),
			'top': this.handle_limit.top + (perc_y * (this.track.getSize().y - this.handle.getSize().y - (this.handle_limit.top * 2)))
		});
	},
	
	resize: function(bar_size_perc)
	{
		if(typeOf(bar_size_perc) != 'null')
		{
			this.handle.setStyle(
				this.options.axis == 'x' ? 'width' : 'height', 
				Math.max(this.options.minHandleSize, (bar_size_perc * this.track.getSize()[this.options.axis]))
			);

		}	
		
		this.handle_limit = {
			'left': this.handle_init.x,
			'top': this.handle_init.y,
			'right': this.options.axis == 'x' ? this.track.getSize().x - this.handle.getSize().x - this.handle_init.x : this.handle_init.x,
			'bottom': this.options.axis == 'y' ? this.track.getSize().y - this.handle.getSize().y - this.handle_init.y : this.handle_init.y
		};
		if(this.drag) this.drag.options.limit = {
			x: [this.handle_limit.left, this.handle_limit.right], 
			y: [this.handle_limit.top, this.handle_limit.bottom]
		};
		
		this.move(this.position.x, this.position.y);
	},
	
	off: function()
	{
		this.handle.setStyle('display', 'none');
		this.track.setStyle('display', 'none');
	},
	
	on: function()
	{
		this.handle.setStyle('display', 'block');
		this.track.setStyle('display', 'block');
	},
	
	toElement: function()
	{
		return this.el;
	}
});
	

/* Automatically create a scroll bar from an existing element. */
Kemso.ScrollBar.Auto = new Class({
	
	Extends: Kemso.ScrollBar,
	
	options: {
		axis: 'y',
		position: 'relative'
	},

	initialize: function(el, options)
	{
		this.setOptions(options);
		
		this.el = document.id(el);
		this.el.store('ScrollBar', this);
		this.el.setStyles({'overflow': 'hidden', 'position': (this.el.getStyle('position') == 'absolute' ? 'absolute' : this.options.position)});
		
		this.content = new Element('div', {'class': 'scroll-container', 'styles': {
			'position': 'absolute', 
			'overflow': 'hidden',
			'top': 0, 'right': 0, 'bottom': 0, 'left': 0,
			'padding': this.el.getStyle('padding')
		}});
		var childNodes = Array.clone(this.el.childNodes);
		for(var i = 0, l = childNodes.length; i < l; i++){
			var child = childNodes[i];
			if(child.nodeType == 1) document.id(child).inject(this.content);
			else if(child.nodeType == 3) this.content.appendChild(child);
		}
		this.content.inject(this.el);
		
		
		this.track = new Element('div', {
			'class': 'scroll-bar-track',
			'styles': {
				'position': 'absolute',
				'top': 0,
				'right': 0,
				'bottom': 0
			}
		}).inject(this.el);
	
		this.handle = new Element('div', {
			'class': 'scroll-bar-handle',
			'styles': {
				'position': 'absolute',
				'top': 0,
				'left': 0
			}
		}).inject(this.track);
		
		if(this.options.axis == 'x')
		{
			this.track.setStyles({'top': 'auto', 'left': 0});
			this.handle.setStyles({'top': 0, 'left': 'auto', 'bottom': 0});
		}
			
		this.parent(this.content, this.track, this.handle);
	}
	
});

function $ScrollBar(el){
	return document.id(el).retrieve('ScrollBar');
}





var AssetLoader = new Class({
	Implements: [Options, Events],
	options: {
		type: false,
		auto_load: true,
		events: {}
	},
	initialize: function(src, options)
	{
		this.setOptions(options);
		this.loaded = false;
		this.addEvent('load', function(){ this.loaded = true; }.bind(this));
		this.addEvents(this.options.events);
		
		if(typeOf(src) == 'array')
		{
			this.assets = [];
			this.load_count = 0;
			for(var i = 0, l = src.length; i < l; i++)
			{
				this.assets.push(new AssetLoader(src[i], {
					auto_load: false, 
					events: {
						'load': function(){
							this.load_count++;
							if(this.load_count == this.assets.length)
							{
								this.fireEvent('load');
							}
						}.bind(this)
					}
				}));
			}
			
			this.assets.each(function(a){ a.load(); });
			
			return true;
		}		
		
		this.source = src;
		this.filetype = typeOf(this.options.type) == 'string' ? this.options.type : this.source.substr(this.source.lastIndexOf('.')+1);
		
		if(this.options.auto_load === true) this.load();
	},
	
	
	load: function()
	{
		switch(this.filetype)
		{
			case 'png':
			case 'jpg':
			case 'jpeg':
			case 'gif':
			case 'tiff':
			case 'image':
				var image = new Image();
				image.src = this.source;
				if(image.complete) this.fireEvent('load');
				else image.onload = this.fireEvent.bind(this, 'load');
				break;
			case 'js':
				this.el = new Element('script', {
					'type': 'text/javascript',
					'src': this.source, 
					'onload': function(){ this.fireEvent('load'); }.bind(this)
				}).inject($(document.body).getElementsByName('head')[0]);
				break;
			case 'css':
				this.el = new Element('img', {
					'type': 'text/css',
					'rel': 'stylesheet',
					'media': 'screen',
					'href': this.source, 
					'onload': function(){ this.fireEvent('load'); }.bind(this)
				}).inject($(document.body).getElementsByName('head')[0]);
				break;
		}
	}
});


/*
---
Kemso More Extensions

copyrights:
  - [Kemso](http://kemso.com)

licenses:
  - You may not under any circumstances copy, redistribute, or re-sell this code, 
  	or use it as the basis for another site or application.
  - You may modify this code for the purposes of modifying a single insillation of the 
  	purchased product which which this code was distributed
  - http://whiteloupe.com/license.txt
...
*/



/*
---
Kemso more extensions






/*
---

name: LoadImage

description: Loads an image, showing a spinner and fading in on load. 
Optionally replaces image with pixel.gif, setting source to background-image

license: MIT-style license.

authors: Kemso, LLC (http://www.kemso.com)
			- Matt McCloskey

provides: [Touch]

...
*/

var LoadImage = new Class({

	Implements: [Options, Events],
	
	options: {
		replace: true,
		spinner_size: 'large',
		events: {},
		spinner: {
			lines: 13, // The number of lines to draw
			length: 6, // The length of each line
			width: 2, // The line thickness
			radius: 4, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#000', // #rgb or #rrggbb or array of colors
			speed: 1.9, // Rounds per second
			trail: 60, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px
		},
		set_opacity: true,
		usecss: true
	},
	
	initialize: function(el, options)
	{
		var c = el.retrieve('LoadImageRef');
		if(c)
		{
			c.setOptions(options);
			c.run();
			return c;
		}
		LoadImageInstances.push(this);
		
		this.setOptions(options);
		this.img = document.id(el);
		
		this.run();
	},
	
	run: function(options)
	{
		if(options) this.setOptions(options);
		
		this.src = this.img.get('data-src') ? this.img.get('data-src') : this.img.get('src');
		
		if(this.img.retrieve('loading') || (this.img.retrieve('loaded') && this.img.retrieve('loaded_src') == this.src))
		{
			// image has been loaded already, check the source
			//if($(this.img).src == this.img)
			return $C(this.img);
		}
		
		this.img.store('ClassRef', this);
		this.img.store('LoadImageRef', this);
		
		if(this.options.spinner)
		{	
			this.spinner = new Spinner(this.options.spinner).spin(this.img.getParent());
			//new Spinner({relativeTo: this.img.getParent(), 'size': this.options.spinner_size}).start();
			document.id(this.spinner).position({relativeTo: this.img});
			this.onResize = function(){
				// if image still exists and the spinner is running, reposition it...
				if(this.img && typeOf(this.spinner.el) == 'element') document.id(this.spinner.el).position({relativeTo: this.img});
			}.bind(this);
			this.onResize.delay(500);
			window.addEvent('resize', this.onResize);
		}
		
		
		// Swap image src with pixel.gif and set background-image to original source
		// This helps prevent image theft, and gets around mobile web-kit memory issues
		if(this.options.replace && config && config.site_url)
		{
			this.img.setStyles({
				'background-image': 'url('+this.src+')',
				'background-repeat': 'no-repeat'
			}).set('src', config.get('site_url')+'assets/images/pixel.gif');
		}
		else if(this.img.get('src') != this.src)
		{
			this.img.set('src', this.src);
		}
		
		this.addEvents(this.options.events);
		
		// Fade the image in when it's loaded
		this.img.style.webkitTransition = 'opacity 0ms cubic-bezier(0.09,0.25,0.24,1)';
		this.img.style.MozTransition = 'opacity 0ms cubic-bezier(0.09,0.25,0.24,1)';
		if(this.options.set_opacity) this.img.style.opacity = '0';
		this.img.setStyles({
			'-webkit-transform': 'translate3d(0px, 0px, 0px)'
		});
		this.img.store('loading', true);
		this.img.addClass('loading');
		/*
this.img.set('src', '');
		return;
*/
		new AssetLoader(this.src, {
			type: 'image',
			events: {
				'load': function(){
					
					$(this.img).addClass('loaded').removeClass('loading');
					this.img.store('loading', false);
					this.img.store('loaded', true);
					this.img.store('loaded_src', this.src);
					this.img.fireEvent('loaded', [this.img]);
					
					// Use CSS transitions where available for better results
					//this.options.usecss = true;
					if(this.options.usecss && (Browser.Platform.ios || Browser.Platform.android || Browser.Platform.webos || Browser.safari || Browser.chrome || Browser.firefox))
					{
						this.img.style.webkitTransition = 'opacity 0s linear';
						this.img.style.MozTransitionDuration = 'opacity 0s linear';
						if(this.options.set_opacity) this.img.style.opacity = '0';
						
						(function(){
						this.img.style.visibility = 'visible';
						this.img.style.webkitTransition = 'opacity 1000ms cubic-bezier(0.09,0.25,0.24,1)';
						this.img.style.MozTransition = 'opacity 1000ms cubic-bezier(0.09,0.25,0.24,1)';
						this.img.style.opacity = '1'; 
						}.bind(this)).delay(1);
					}
					else
					{
						if(this.options.set_opacity) document.id(this.img).setStyle('opacity', 0);
						this.img.style.visibility = 'visible';
						if(this.options.set_opacity) document.id(this.img).set('tween', {duration: 300}).tween('opacity', [0,1]);
						//this.img.style.visibility = 'visible';
					}
					
					if(this.spinner) this.spinner.stop();
					//this.spinner = false;
					if(this.onResize) window.removeEvent('resize', this.onResize);
					
					$$(LoadImageInstances).update_loader();
					
					this.fireEvent('load', this.img);
				}.bind(this)
			}
		});
		
		
	},
	
	toElement: function()
	{
		return this.img;
	},
	
	unload: function()
	{
	
	},
	
	update: function()
	{
		if(this.onResize) this.onResize();
	},
	
	spinner_off: function()
	{
		if(this.spinner) this.spinner.stop();
	}
});

var LoadImageInstances = [];


Element.implement({
	load: function(options)
	{
		if(this.get('tag') != 'img') return false;
		
		if(this.retrieve('LoadImageRef'))
		{
			var loader = this.retrieve('LoadImageRef');
			loader.run(options);
			return loader;
		}
		else
		{
			new LoadImage(this, options);
		}
		return this;
	},
	
	unload: function()
	{
		if(this.get('tag') != 'img') return false;
		
		var src = this.get('src');
		if( ! this.get('data-src')) this.set('data-src', src);
		this.set({'src': config.site_url+'assets/images/pixel.gif', 'styles': {'background-image': 'none'}});
		this.store('loaded', false);
	},
	
	update_loader: function()
	{
		if(this.retrieve('LoadImageRef'))
		{
			var loader = this.retrieve('LoadImageRef');
			loader.update();
		}
	}
});

Elements.implement({
	load: function(options)
	{
		this.each(function(el){ el.load(options); });
	},
	
	unload: function()
	{
		this.each(function(el){ el.unload(); });
	},
	
	update_loader: function()
	{
		this.each(function(el){ el.update_loader(); });
	}
});

Element.Events.loaded = {
    onAdd: function(){
        
        if(this.get('tag') != 'img') return false;
		
		if( ! this.retrieve('LoadImageRef'))
		{
			new LoadImage(this);
		}
		else
		{
			//if(this.retrieve('loaded') == true) this.fireEvent.delay(20, this, ['loaded']);
			if(this.retrieve('loaded') == true) this.fireEvent('loaded');
		}
    }
};




/*
---
MooTools: Touch extensions

/*
---

name: Touch

description: Mootools Touch by Kemso

license: MIT-style license.

authors: Kemso, LLC (http://www.kemso.com)
			- Matt McCloskey

provides: [Touch]

...
*/


(function(){

this.Touch = {
	version: '1.0'
};

// Touch.Scroll stuff - (Note: Left for compatibility. Need to upgrade these to Mootools 1.3 core vars)
// Is translate3d compatible?
var has3d = this.has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
// Device sniffing
var isIthing = this.isIthing = (/iphone|ipad/gi).test(navigator.appVersion);
var isTouch = this.isTouch = ('ontouchstart' in window);
// Translate3d helper
var translateOpen = this.translateOpen = 'translate' + (has3d ? '3d(' : '(');
var translateClose = this.translateClose = has3d ? ',0)' : ')';
	
})();



/* Add touch events */
Element.Events.swipe = {

	onAdd: function(){
		var startEvent = {}, endEvent = {};
		var buffer = 3;
		var body = document.getElementsByTagName('body')[0];
		this.addEventListener('touchstart', function (event) {
			//event.preventDefault();
			startEvent.x = event.touches[0].pageX;
			startEvent.y = event.touches[0].pageY;
		}, false);
		this.addEventListener('touchmove', function (event) {
			endEvent.x = event.touches[0].pageX;
			endEvent.y = event.touches[0].pageY;
			if(Math.abs(startEvent.x - endEvent.x) > buffer || Math.abs(startEvent.y - endEvent.y) > buffer){
				event.preventDefault();
			}			
		}, false);
	
		this.addEventListener('touchend', function (event) {
			var changeX = startEvent.x - endEvent.x,
			    changeY = startEvent.y - endEvent.y,
			    changeRatio = Math.abs(changeX / changeY);
			
			if (changeRatio > 2.5) {
				// The swipe was "clearly" dominant in either the X or Y directions.
				if (changeX < 0) {
					// Motion was left-to-right across the screen.
					event.direction = 'right';
				} else {
					// Motion was right-to-left across the screen.
					event.direction = 'left'
				}
				this.fireEvent('swipe', event);
			} else if (changeRatio < 0.4) {
					if (changeY < 0) {
			    	// Motion was top-to-bottom across the screen.
					event.direction = 'down';
				} else {
			   		// Motion was bottom-to-top across the screen.
					event.direction = 'up';
				}
				this.fireEvent('swipe', event);
			}
			
		}, false);
	}
};


Element.Events.tap = {

	onAdd: function(){
		var startEvent = {};
		var endEvent = {};
		var buffer = 3;
		this.addEvents({
			'touchstart': function(e){ 
				e.preventDefault(); 
				this.store('touchmoved', false);
				this.store('hastouch', true);
				startEvent.x = e.touches[0].pageX; 
				startEvent.y = e.touches[0].pageY;
			},
			'touchmove': function(e){ 
				endEvent.x = e.touches[0].pageX;
				endEvent.y = e.touches[0].pageY;
				if(Math.abs(startEvent.x - endEvent.x) > buffer || Math.abs(startEvent.y - endEvent.y) > buffer)
				this.store('touchmoved', true); 
			},
			'click': function(e){ e.stop(); if( ! this.retrieve('touchmoved') && ! this.retrieve('hastouch')) this.fireEvent('tap', e); }.bind(this),
			'touchend': function(e){ if( ! this.retrieve('touchmoved')){ /* trace('tap'); */ this.fireEvent('tap', e); }else{ /* trace('touch move') */ } }.bind(this)
		});
	}

};






// OverLabel
var OverLabel = new Class({
	
	initialize: function(input)
	{
		OverLabel.register(this);
			
		input = document.id(input);
		if(document.id(document.body).getElement('label[for="'+input.get('id')+'"]') && ! input.retrieve('overlabel'))
		{
			input.store('overlabel', this);
			
			var label = document.id(document).getElement('label[for="'+input.get('id')+'"]');
			
			this.input = input;
			this.label = label.addClass('overlabel');
			
			label.setStyles({
				'position': 'absolute',
				'color': input.getStyle('color'),
				'font-size': input.getStyle('font-size'),
				'line-height': input.getStyle('line-height'),
				'width': input.getStyle('width'),
				'padding-top': input.getStyle('padding-top').toInt() + 1,
				'padding-right': input.getStyle('padding-right').toInt() + 1,
				'padding-bottom': input.getStyle('padding-bottom').toInt() + 1,
				'padding-left': input.getStyle('padding-left').toInt() + 1
			});
			label.position({relativeTo: input, position: 'topLeft', edge: 'topLeft'});
			
			input.addEvent('blur', function(){ input.store('hasFocus', false); });
			input.addEvents({
				'click': this.enterEdit.bind(this),
				'focus': this.enterEdit.bind(this),
				'blur': this.leaveEdit.bind(this),
				'keyup': this.assert.bind(this),
				'keypress': function(){ label.setStyles({'display': 'none'}); }
			});
			input.addEvents({
				'click': this.update.bind(this),
				'focus': this.update.bind(this),
				'blur': this.update.bind(this)
			});
			label.addEvents({
				'click': this.enterEdit.bind(this)
			});
			
			this.assert();			
		}
	},
	
	assert: function()
	{
		if(this.input.get('value').length > 0){
			this.label.setStyles({'display': 'none'});
		} else {
			this.leaveEdit();
		}
	},
	
	enterEdit: function()
	{
		this.assert();
		this.input.store('hasFocus', true);
		this.input.focus();
		this.label.setStyle('opacity', .5);
	},
	
	leaveEdit: function()
	{
		if(this.input.get('value') == '') this.label.setStyles({'display': 'block', 'opacity': this.input.retrieve('hasFocus') ? .5 : 1});
		else this.label.setStyles({'display': 'none'});
	},
	
	update: function(all)
	{
		this.label.position({relativeTo: this.input, position: 'topLeft', edge: 'topLeft'});
		this.assert();
		
		if(typeOf(all) == 'null' || all == true)
		{
			// Update the rest
			OverLabel.instances.each(function(i){
				if(i !== this) i.update(false); 
			}.bind(this));
		}
	}
});


OverLabel.instances = [];
OverLabel.register = function(el){
	return OverLabel.instances.push(el);
};
OverLabel.update = function(){
	OverLabel.instances.each(function(i){ i.update(false); });
};


OverLabel.init = function(){
	document.id(document.body).getElements('input[type="text"].overlabel, textarea.overlabel').each(function(el){ new OverLabel(el); });
};

window.addEvent('domready', function(){
	OverLabel.init();
});