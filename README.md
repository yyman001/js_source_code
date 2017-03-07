# 源码分析
并把源码部分有用的代码提取出来

 - nprogress.js
 
 
 
 
 
 
 
 ###其他代码块
 
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
 
 ####DOM 操作
 
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
  
  
  
```