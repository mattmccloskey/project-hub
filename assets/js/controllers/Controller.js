/*
---
Ember Page Controller: The Ember default controller

copyrights:
  - [Kemso, Ember](http://kemso.com, http://emberpack.com)

licenses:
  - [MIT License](http://emberpack.com/license.txt)
...
*/


var Controller = new Class({
	
	Implements: Options,
	
	options: {
	
	
		/* 
		|
		|	Osmek API key goes here!
		|
		*/
		osmek_api_key: '',
		
		
		/* 
		|
		|	Osmek Bin ID (or slug) goes here!
		|
		*/
		osmek_bin_id: ''
		
	},
		
	
	
	/* 
	|
	|	Set options.Initialize the page.
	|
	*/
	initialize: function(options)
	{

		/*
		*	Set the options
		*/
		this.setOptions(options);
		
		
		// External links
		$$('a[rel*="external"]').addEvent('click', function(e){
			e.preventDefault();
			window.open(this.get('href'));
		});
		
		// Mails
		$$('a[href^="mailto:"]').each(function(el){
			var 
				mail = el.get('href').replace('mailto:',''),
				replaced = mail.replace('/at/','@');
			el.set('href', 'mailto:' + replaced);
			if(el.get('text') === mail) {
				el.set('text', replaced);
			}
		});
		
		
		if( ! this.options.osmek_api_key || ! this.options.osmek_bin_id)
		{
			$('content').set('html', '<h2>API key or Bin ID not found</h2>'
				+'<ol>'
				+'<li>Get an Osmek account - osmek.com</li>'
				+'<li>Create a Multi-Entry bin called "Pages".</li>'
				+'<li>Create a Drop-down custom field in that bin called "Parent". The keyword should be set to parent_id and the values should be set to "fill values from another content bin." with the "Pages" bin selected.</li>'
				+'<li>Paste your API key and the Pages bin ID into assets/js/controllers/Controller.js</li>'
				+'</ol>');
			return false;
		}
		
		$$('.logo').setStyle('cursor', 'pointer').addEvent('click', function(e){
			e.stop();
			this.first_page();
		}.bind(this));
		
		this.main_nav = $('well').getElement('nav').empty();
		
		new Request.JSONP({url: 'http://api.osmek.com/feed/jsonp?api_key='+this.options.osmek_api_key+'&section_id='+this.options.osmek_bin_id+'&auto_link=1'}).addEvents({
			'success': function(rsp){
				this.items = rsp.items;
				this.build_nav(rsp.items.filter(function(i){ if(i.parent_id == 0) return true; else return false; }), $('well').getElement('nav'));
				
				if(location_hash())
				{
					var url_title = location_hash();
					for(var i = 0, l = this.items.length; i < l; i++)
					{
						if(this.items[i].url_title == url_title)
						{
							this.show_page(this.items[i]);
							this.items[i].link.getParents('.children').reveal();
							break;
						}
					}
				}
				else
				{
					this.first_page();
				}
				
				window.addEvent('hashchange', function(value){
					for(var i = 0, l = this.items.length; i < l; i++)
					{
						if(this.items[i].url_title == value)
						{
							this.show_page(this.items[i]);
							this.items[i].link.getParents('.children').reveal();
							break;
						}
					}
				}.bind(this));
			}.bind(this)
			
		}).send();

	},
	
	first_page: function()
	{
		for(var i = 0, l = this.items.length; i < l; i++)
		{
			if(this.items[i].parent_id == 0)
			{
				this.show_page(this.items[i]);
				break;
			}
		}
	},
	
	build_nav: function(items, container)
	{		
		items.each(function(item){
			var a = new Element('a', {'href': '#', 'html': item.title, 'id': 'item-'+item.id}).inject(container.get('tag') == 'ul' || container.get('tag') == 'ol' ? new Element('li').inject(container) : container);
			
			a.addEvent('click', function(e){
				e.stop();
				this.show_page(item);
			}.bind(this));
			
			if( ! $('children-'+item.id))
			{
				new Element(a.getParent('ul') ? 'ol' : 'ul', {'id': 'children-'+item.id, 'class': 'children'}).inject(a, 'after').set('reveal', {duration: 200});
			}
			this.build_nav(this.items.filter(function(i){ if(i.parent_id == item.id) return true; else return false; }, this), $('children-'+item.id));
			
			item.link = a;
			item.children = $('children-'+item.id);
			
		}.bind(this));
	},
	
	
	show_page: function(item)
	{
		$('content').set('class', 'page'+item.id);
		this.main_nav.getElements('.selected').removeClass('selected');
		item.link.addClass('selected');
		item.children.reveal();
		this.items.each(function(i){
			if(i.id != item.id && ! item.link.getParent('#children-'+i.id)) i.children.dissolve();
		});
		$('content').setStyle('opacity', 0).set('html', '<h1>'+item.title+'</h1>'+item.postbody).tween('opacity', 1);
		
		location_hash(item.url_title);
		
		// Click to enlarge images
		$('content').getElements('img').each(function(img){
			img.setStyle('cursor', 'pointer').addEvent('click', function(e){
				e.stop();
				this.show_image(img);
			}.bind(this))
		}.bind(this));
		
	},
	
	show_image: function(img)
	{
		var image_url = osmek_photo_url(img, 'o');
		
		if(image_url)
		{
			var box = new Element('div', {'class': 'lightbox', 'styles': {'background-image': 'url('+image_url+')'}}).inject($(document.body)).addEvent('click', function(){ this.destroy(); });
			var spinner = new Spinner();
			spinner.spin(box);
			new AssetLoader(image_url, {'type': 'jpg', events: {
				'load': function(){ 
					spinner.stop();
				}
			}});
		}
	}
	
	
});



/*
*	Set up HTML5 Elements
*/
function doeach(arr, fn) {
    for (var i = 0, arr_length = arr.length; i < arr_length; i++) {
        fn.call(arr, arr[i], i);
    }
}
doeach("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function(el) { document.createElement(el); });