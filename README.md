# deep-swig

deep-swig provides deepjs styled client for swigjs (template engine) http://paularmstrong.github.io/swig/

## Install
```shell
npm install deep-swig
```
or

```shell
bower install deep-swig
```

## Usage

// example through deepLoad
```javascript
require("deep-swig")();
require("deep-node/lib/rest/file/json")();

var obj = {
	template:"swig::./path/to/my/swig/template",
	context:{
		myData:"json::./path/to/datas.json",
		myTitle:"Hello world"
	}
};

deep.nodes(obj)
.deepLoad()
.done(function(obj){
	return obj.template(obj.context);
})
.log();
```


