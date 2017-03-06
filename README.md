# nprogress.js

首页查看这个js的主要主体,由于需要让文件指出文件模块方式加载,所以使用一个工厂方式判断返回当前支持的模式
    
```javascript
//这个好像是模块化的工厂化方法吧?不支持对不对?
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) { //支持required.js
    define(factory);
  } else if (typeof exports === 'object') {    //支持node , sea.js 支持?不记得了
    module.exports = factory();
  } else { //最后这种是普通的调用方式
    root.NProgress = factory(); //NProgress 在不支持模块支持情况下,全局抛出
    //即最原始的js调用方式,使用NProgress.xx方法进行调用
  }

})(this, function() {
//核心代码写在这里
var NProgress;
//核心代码在这里,我们把它抽出来再慢慢一个个分析
return NProgress; //记得返回该对象
})
```

####抽出的主体`NProgress`核心代码

```javascript
  var NProgress = {};       			//1.创建一个对象

  NProgress.version = '0.2.0';			//2.版本
  
  var Settings = NProgress.settings = {} //3.把具体参数存在一个对象
  
  NProgress.configure = function(options) {}   //4.根据`options`重置参数
  
  NProgress.status = null;			    //5.状态?可能 等于1的时候标志加载完成
  
  NProgress.set = function(n) {}      //6.应该是核心逻辑方法,里面代码比较多
  
  NProgress.isStarted = function() {} //7.判断是否已经开始执行
  
  NProgress.start = function() {}	  //8.开始方法
  
  NProgress.done = function(force) {} //9.结束方法
  
  /**
   * Increments by a random amount.
   */
  NProgress.inc = function(amount) {} //10.随机执行进度条长度???
  
  NProgress.trickle = function() { //11.
  	return NProgress.inc();   // amount怎么传进去??
  }  
  
  /**
   * Waits for all supplied jQuery promises and
   * increases the progress as the promises resolve.
   *
   * @param $promise jQUery Promise
   */
  (function() {
 	 var initial = 0, current = 0;
  	NProgress.promise = function($promise) {}
  })();
  //12.这里很有意思,借用jquery的promise 对象进行自身的 promise 对象的模拟,这块代码应该可以抄出来,让其他的代码可以模拟异步
  
  
  /**
   * (Internal) renders the progress bar markup based on the `template`
   * setting.
   */
	NProgress.render = function(fromStart) {} //13.渲染html?难道这个才是核心,等到下面进行详细分析就知道了,现在暂且先保留
    
  /**
   * Removes the element. Opposite of render().
   */

    NProgress.remove = function() {} //14.移除自己
    
    /**
   * Checks if the progress bar is rendered.
   */
  NProgress.isRendered = function() {
    return !!document.getElementById('nprogress');   //15.根据返回元素是否为空,判断是否渲染成功
  };

  /**
   * Determine which positioning CSS rule to use.
   */
   NProgress.getPositioningCSS = function() {} //16.自己写的获取css方法,唠叨,可以提取
   
   /**
   * Helpers
   */
   function clamp(n, min, max) {}  //17.不懂的英文,锁定???
   
   /**
   * (Internal) converts a percentage (`0..1`) to a bar translateX
   * percentage (`-100%..0%`).
   */
  function toBarPerc(n) {
    return (-1 + n) * 100;  //18.获取进度百分比,注意这里的 -1 + n 
  }

  /**
   * (Internal) returns the correct CSS for changing the bar's
   * position given an n percentage, and speed and ease from Settings
   */
  function barPositionCSS(n, speed, ease) {} //19.设置进度条(c:长度,speed:速度,ease:缓存动画函数)

  /**
   * (Internal) Queues a function to be executed.
   */
  var queue = (function() {})();//20.又是一个有趣的方法,可以提取,模拟队列

  var css = (function() {})(); //21.又长又臭的元素css操作,应该是在jq中提取的

//以下这些不进行讲解,直接提取出来使用,也就是平时的原生dom的操作
  function hasClass(element, name) {} //元素判断是否存在class

  function addClass(element, name) {}

  function removeClass(element, name) {}

  function classList(element) {}

  function removeElement(element) {}
```