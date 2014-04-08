/*
---
Ember Controller: Example Home controller

copyrights:
  - [Kemso, Ember](http://kemso.com, http://emberpack.com)

licenses:
  - [MIT License](http://emberpack.com/license.txt)
...
*/

/*
*	This controller will get loaded when the home controller is active in CI.
*/

var Home = new Class({
	
	Extends: Controller,
	
	initialize: function()
	{
		this.parent.attempt(arguments, this);
		
		/* Controller wide code goes here */

	},
	
	/*
	*	Methods get called automatically corresponding to the active CI method
	*/
	index: function()
	{
		
	}
	
	
});