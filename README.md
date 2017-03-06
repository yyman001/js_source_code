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

})(this, function() {
//核心代码写在这里
    var NProgress;


    return NProgress; //记得返回该对象
});

 ```
 