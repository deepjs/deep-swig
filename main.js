if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require","deep/deep", "deep-ui/stores/html"],function (require, html)
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
	//_____________________________________________________
	var filtersObject = {

		mongoIDtoStringID:function(input){
			//return "test";
			return input;
		},
		inArray:function(input, array){
			return utils.inArray(input, array);
		},
		outArray:function(input, array){
			return !utils.inArray(input, array);
		},
		select:function (input, what) {
			console.log("swig.filter.select : ", input, what);
			return utils.retrieveValueByPath(input, what);
		},
		notnull : function(input) {
			if(input == null || input == "null")
				return "";
			return input;
		},
		comaArray : function(input) {
			var res = "";
			var first = true;
			for(var i = 0; i < input.length; ++i) {
				if(!first)
					res += ", ";
				else
					first = false;
				res += String(input[i]);
			}
			return res;
		},
		writeTaxo : function(input, map) {

			//console.log("Swig.writeTaxo : "+JSON.stringify(input))
			//console.log( " - with : "+JSON.stringify(map))

			var res = "";
			var first = true;
			for(var i = 0; i < input.length; ++i) {
				if(!map["m" + input[i]])
					continue;
				if(!first)
					res += ", ";
				else
					first = false;
				res += String(map["m" + input[i]].label.fr);
			}
			return res;
		},
		idToLabel : function(id, collection, language) {
 
            //console.log("Swig.idToLabel : "+JSON.stringify(id))
            //console.log( " - with : "+JSON.stringify(language))
 
            for(var i=0; i < collection.length ; i++){
                var item = collection[i];
 
                if(item.id == id){
                    //console.log( "MATCHING : "+JSON.stringify(item.label[language]))
                    return item.label[language];
                }
            }
 
        },
		selectIfinArray : function(what, inArr) {
			if(utils.inArray(what, inArr))
				return "selected";
			return "";
		},
		checkIfinArray : function(what, inArr) {
			if(utils.inArray(what, inArr))
				return "checked";
			return "";
		},
		smartdate : function(input) {
			//console.log("to date : "+input)
			var inp = parseInt(input);
			var d = new Date(inp * 1000);
			return d.toLocaleDateString() + " - " + d.toLocaleTimeString();
		},
		query: function(input, query){
			if(input.path)
					return JsonQuery.query(input, ((input.path != "/")?(input.path+"/"):input.path)+query, null, null, { keepCache:true });
			return JsonQuery.query(input, query, null, null, { keepCache:true })
		},
		removeFirstChar: function(input){
			return input.substring(1);
		},
		json:function(input){
			//console.log("swig json : ", input);
			return JSON.stringify(input, null, ' ')
		},
		floor:function(input){
			return Math.floor(input);
		},
		ceil:function(input){
			return Math.ceil(input);
		},
		gridCollumnIndex:function(input, numCols){
			//console.log("gridCollumnIndex : ", input, " - ", numCols, " res : ", input%numCols)
			return input%numCols;
		},
		isTypeOfObject:function(input){
			console.log("typeofobject : ", input)
			if(typeof input === "object"){
				return true
			}else{
				return false
			}
		}
	}

filtersObject.join_coma = comaArray;
	/**
	 * swig related : produce swig-macro-import string
	 * @deprecated
	 * @category swig
	 * @method getMacroImport
	 * @static
	 * @param  {ViewController} controller
	 * @param  {Array} macrosSet
	 * @return {String} the macro import string
	 */
	deep.utils.getMacroImport = function(controller, macrosSet)
	{
		var renderedTemplate = "";
		if(controller.layer && controller.layer.templates)
		{    
			var macros = controller.layer.templates.macros;
			for (var i in macros)
			{
				if(!macros.hasOwnProperty(i) || (macrosSet && ! i in macrosSet))
					continue;
				var  m = macros[i];
				var prefix = "";
				var index = m.indexOf(":");
				if(index > -1)
				{    
					prefix = m.substring(0,index);
					m = m.substring(index+2);
				}
				renderedTemplate += "{% import '" + m + "' as "+i+" %}\n";
			}
		}
		return renderedTemplate;
	}

	function init(layer)
	{
		var defaultObj = {
			filters : filtersObject,
			allowErrors: true,
		    autoescape: true,
		    encoding: 'utf8',
		    root: '/',
		    tags: {},
		    extensions: {},
		    tzOffset: 0
		}
		if(layer)
			deep.utils.up(layer, defaultObj);
		swig.init(defaultObj);
	}
	return init;
});