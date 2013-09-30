if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require","deep/deep"],function (require, deep)
{
	
	var deep = require("deep/deep");

	swig = require("swig");

	deep.ui = deep.ui ||  {};
	deep.ui.swig = function(string, options) {
		options = options || {};
		return swig.compile(string, options);
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
		if(options.cache !== false && deep.mediaCache.cache["swig::"+path])
			return deep.mediaCache.cache["swig::"+path];
		var def = deep.Deferred();
		fs.readFile(path, function(err, datas){
			if(err)
			{
				delete deep.mediaCache.cache["swig::"+path];
				return def.reject(err);
			}	
			if(datas instanceof Buffer)
				datas = datas.toString("utf8");
			var resi = swig.compile(datas, { filename:deep.utils.stripFirstSlash(path) });
			//console.log("swig store : resi ", resi);
			def.resolve(resi);
		});
		var d = def.promise();
		if(options.cache !== false || (self.options && self.options.cache !== false))
			deep.mediaCache.manage(d, "swig::"+path);
		return d;
	};
	
	return require("./init");
});






