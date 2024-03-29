# 源码分析
并把源码部分有用的代码提取出来

 - nprogress.js
 
 
 
 
 
 
 
 ### 其他代码块
 
 让文件支持模块化
 ```javascript
 ;(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.NProgress = factory(); //NProgress 在不支持模块支持情况下,全局抛出的变量名
    //即最原始的js调用方式,使用NProgress.xx方法进行调用
  }

})(this, function() {  //this => windows
//核心代码写在这里
    var NProgress;
    return NProgress; //记得返回该对象
});

 ```
 // jq 插件支持模块化
 ```js
 (function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
//code 
});
 ```
 
 
 ### DOM 操作
 
```javascript

  function hasClass(element, name) {
    var list = typeof element == 'string' ? element : classList(element);
    return list.indexOf(' ' + name + ' ') >= 0;
  }

  function addClass(element, name) {
    var oldList = classList(element),
        newList = oldList + name;

    if (hasClass(oldList, name)) return;

    // Trim the opening space.
    element.className = newList.substring(1);
  }
  
 function classList(element) {
    return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
  }
  
  function removeClass(element, name) {
    var oldList = classList(element),
        newList;

    if (!hasClass(element, name)) return;

    // Replace the class name.
    newList = oldList.replace(' ' + name + ' ', ' ');

    // Trim the opening and closing spaces.
    element.className = newList.substring(1, newList.length - 1);
  }
  
  function removeElement(element) {
    element && element.parentNode && element.parentNode.removeChild(element);
  }
  
  获取元素样式
  function getStyle(elem, property) {
    // ie通过currentStyle来获取元素的样式，其他浏览器通过getComputedStyle来获取
    return document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(elem, false)[property] : elem.currentStyle[property];
}
  
```

### 检测
Javascript检测浏览器对WebP的支持,[更多](http://stackoverflow.com/questions/5573096/detecting-webp-support#new-answer?newreg=13847b7476cc4ddf8f75e58ffd075e4a)
2个让浏览器支持webp的js插件
- [WebPJS](http://webpjs.appspot.com/)
- [Libwebp Javascript - beta](http://libwebpjs.appspot.com/)
```javascript
//1
var hasWebP = false;
(function() {
  var img = new Image();
  img.onload = function() {
    hasWebP = !!(img.height > 0 && img.width > 0);
	//set cookie
  };
  img.onerror = function() {
    hasWebP = false;
	//set cookie
  };
  img.src = 'http://www.gstatic.com/webp/gallery/1.webp';
})();

//2
function hasWebP() {
  var rv = $.Deferred();
  var img = new Image();
  img.onload = function() { rv.resolve(); };
  img.onerror = function() { rv.reject(); };
  img.src = 'http://www.gstatic.com/webp/gallery/1.webp';
  return rv.promise();
}
//use
hasWebP().then(function() {
  // ... code to take advantage of WebP ...
}, function() {
  // ... code to deal with the lack of WebP ...
});

//[美团](http://zmx.im/blog?bname=webp)
function detectWebp () {
    if (!window.localStorage || typeof localStorage !== 'object') return;

    var name = 'webpa'; // webp available
    if (!localStorage.getItem(name) || (localStorage.getItem(name) !== 'available' && localStorage.getItem(name) !== 'disable')) {

        var img = document.createElement('img');

        img.onload = function () {
            try {
                localStorage.setItem(name, 'available');
            } catch (ex) {
            }
        };

        img.onerror = function () {
        try {
                localStorage.setItem(name, 'disable');
            } catch (ex) {
            }
        };
        img.src = 'data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAsAAAABBxAREYiI/gcAAABWUDggGAAAADABAJ0BKgEAAQABABwlpAADcAD+/gbQAA==';
    }
}

```
### 短时间中断一样的请求连接
例子取消了重复发送的Ajax请求，这个在我们日常测试场景中也非常常见，例如疯狂点击会发送请求的按钮。
```javascript

var currentRequests = {};

$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
  if ( options.abortOnRetry ) {
    if ( currentRequests[ options.url ] ) {
      currentRequests[ options.url ].abort();
    }
    currentRequests[ options.url ] = jqXHR;
  }
});


```

### 重定向url
使用情况根据自身,或者能够些接口不支持跨域或者jsonp
```javascript
$.ajaxPrefilter(function( options ) {
  if ( options.crossDomain ) {
    options.url = "http://mydomain.net/proxy/" + encodeURIComponent( options.url );
    options.crossDomain = false;
  }
});


//线上测试地址拦截转向本地数据测试

$.ajaxPrefilter( "json script", function( options, originalOptions, jqXHR ) {
	// Modify options, control originalOptions, store jqXHR, etc
	console.log(options,'///');
	console.log(originalOptions,'///');
	console.log(jqXHR,'///');

	if(!!options.url.match('act=getServerList')){
		options.url = 'http://192.168.202.188:9000/test/test.json';
	}
});

```


### 接口异常的统一处理

```javascript

function errorHandler(args, callback) {
        var description;
        var code;
        var message;
        var unknown = "未知";

        //容错处理
        if (args && args.length >= 2) {
            code = args[0].status || unknown;
            description = args[1] || unknown;
        } else {
            code = unknown;
            description = unknown;
        }

        //调用回调函数
        if (callback) {
            if(description == "timeout"){
                message = "请求超时";
            }else if(description == "parsererror"){
                message = "数据解析失败";
            }else if(description == "abort"){
                message = "请求未发出";
            }else{
                message = "请求出错:" + description + " (错误码:" + code + ")";
            }
            callback(message);
        }
    }

```

在实际接口中调用：
```javascript
 $.ajax({
        ...
    }).fail(function(){
        errorHandler(arguments, function(message){
            alert(message);
        });
    });
```
完整文章:http://get.ftqq.com/7552.get
腾讯视频真是地址获取

```javascript
通过下面的方法，你可以在不带任何广告的观看腾讯所有视频

http://v.qq.com/cover/o/obr3rfx7xdatznl.html?vid=b0113x7xx0m
```

视频播放页地址  取vid b0113x7xx0m

页面源码
```html

$('[rel="canonical"]').attr('href')
<link rel="canonical" href="https://v.qq.com/x/cover/9703s6ewjb0l2ar/x0393r5fpe6.html">
x0393r5fpe6 => 视频id

加入后门接口

http://vv.video.qq.com/geturl?vid=b0113x7xx0m&otype=xml&platform=1&ran=0%2E9652906153351068
```

h5rem适配
```javascript

(function (doc, win) {
	var docEl = doc.documentElement;
	var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
	var recalc = function () {
		var clientWidth = docEl.clientWidth;
		if (!clientWidth) return;
		if (clientWidth <= 750) {
			docEl.style.fontSize = (clientWidth / 750 * 100).toFixed(1) + 'px';
		}else{
			docEl.style.fontSize = '100px';
		}
	};
	recalc();
	if (!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc, false);
})(document, window);

```
