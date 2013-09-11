if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require","deep/deep"],function (require, deep, html)
{
	var deep = require("deep/deep");

	swig = require("swig");

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

	var fs = require("fs");
	//__________________________________________________	
	deep.protocoles.swig.get = function (path, options) {
		options = options || {};
		if(options.cache !== false && deep.mediaCache.cache[path])
			return deep(deep.mediaCache.cache[path]).store(this);
		var def = deep.Deferred();
		fs.readFile(path, function(err, datas){
			if(err)
			{
				def.reject(err);
				return;
			}	
			if(datas instanceof Buffer)
				datas = datas.toString("utf8");
			var resi = swig.compile(datas, { filename:deep.utils.stripFirstSlash(path) });
			//console.log("swig store : resi ", resi);
			delete deep.mediaCache.cache["swig::"+path];
			if((options && options.cache !== false)  || (self.options && self.options.cache !== false))
				deep.mediaCache.manage(resi, "swig::"+path);
			def.resolve(resi);
		});
		var d = deep(def.promise()).store(this);
		if(options.cache !== false || (self.options && self.options.cache !== false))
			deep.mediaCache.manage(d, "swig::"+path);
		return d;
	};
	
	return require("./init");
});






