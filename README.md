deep-swig provides protocole definition for swigjs (template engine)


Usage
=======

require("deep-swig/node");
require("deep-node-fs/json").default();



var obj = {
	template:"swig::./path/to/my/swig/template",
	context:{
		myData:"json::./path/to/datas.json",
		myTitle:"Hello world"
	}
}

deep(obj)
.deepLoad()
.done(function(obj){
	return obj.template(obj.context);
})
.log()



