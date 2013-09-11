if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require","deep/deep", "deep-ui/stores/html"],function (require, deep, html)
{
	var deep = require("deep/deep");

	deep.ui = deep.ui ||  {};
	deep.ui.swig = function(string, options) {
		options = options || {};
		return swig.compile(string);
	}

	//__________________________________________________
	deep.protocoles.swig = new deep.Store();
	deep.extensions.push({
		store:deep.protocoles.swig,
		extensions : [
		/(\.(swig)(\?.*)?)$/gi
		]
	});

	deep.protocoles.swig.get = function (id, options) {
		//console.log("swig store : ", id, options)
		options = options || {};
		if(options.cache !== false && deep.mediaCache.cache["swig::"+id])
			return deep(deep.mediaCache.cache["swig::"+id]).store(this);
		var self = this;
		var d = html.get(id, {cache:false})
		.done(function (data) {
			var resi = swig.compile(data, { filename:deep.utils.stripFirstSlash(id) });
			//console.log("swig store : resi ", resi);
			delete deep.mediaCache.cache["swig::"+id];
			if((options && options.cache !== false)  || (self.options && self.options.cache !== false))
				deep.mediaCache.manage(resi, "swig::"+id);
			return resi;
		})
		.store(this);
		if((options && options.cache !== false)  || (self.options && self.options.cache !== false))
			deep.mediaCache.manage(d, "swig::"+id);
		return d;
	};
	
	return require("./init");
});