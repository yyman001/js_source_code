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
  var NProgress = {};       					 //1.创建一个对象

  NProgress.version = '0.2.0';				   //2.版本
  
  var Settings = NProgress.settings = {}         //3.把具体参数存在一个对象
  
  NProgress.configure = function(options) {}     //4.根据`options`重置参数
  
  NProgress.status = null;			    	   //5.状态数值等于`1`的时候标志加载完成
  
  NProgress.set = function(n) {}      		   //6.应该是核心逻辑方法,里面代码比较多
  
  NProgress.isStarted = function() {}           //7.判断是否已经开始执行
  
  NProgress.start = function() {}	           //8.开始方法
  
  NProgress.done = function(force) {}          //9.结束方法
  
  NProgress.inc = function(amount) {}          //10.自增执行进度条长度变化
  
  NProgress.trickle = function() {}           //11.内部调用`NProgress.inc`
  
  (function() {
 	 var initial = 0, current = 0;
  	NProgress.promise = function($promise) {}
  })();
  //12.这里很有意思,借用jquery的promise 对象进行自身的 promise 对象的模拟,这块代码应该可以抄出来,让其他的代码可以模拟异步
  
  NProgress.render = function(fromStart) {} //13.渲染html,初始化bar进度条
    
  NProgress.remove = function() {} //14.移除自己
    
  NProgress.isRendered = function() {}; //15.根据返回元素是否为空,判断是否渲染成功

  NProgress.getPositioningCSS = function() {} //16.判断支持移动的css属性

  function clamp(n, min, max) {}  //17. n > min 反min, n > max 反max
   
  function toBarPerc(n) { return (-1 + n) * 100;}//18.获取进度百分比,注意这里的 -1 + n 

  function barPositionCSS(n, speed, ease) {} //19.设置进度条(c:长度,speed:速度,ease:缓存动画函数)

  var queue = (function() {})();//20.又是一个有趣的方法,可以提取,模拟队列?但实际上是单例模式,也只运行一次

  var css = (function() {})(); //21.又长又臭的元素css操作,应该是在jq中提取的

//以下这些不进行讲解,直接提取出来使用,也就是平时的原生dom的操作
  function hasClass(element, name) {} //元素判断是否存在class

  function addClass(element, name) {}

  function removeClass(element, name) {}

  function classList(element) {}

  function removeElement(element) {}
```
基本展示了代码的函数,接下来我们来看下,代码直接使用了一对象把全部方法和属性都写在里面,这是也是常用模式的一种(?啥来着),
先看下官网简单对他的调用,对于追踪代码有个很好的流程.
粗略看了一下,官网主要有4个主要方法,分别为
```javascript
 NProgress.start()  // — shows the progress bar, 主要方法显示进度条并进行加载,但不会加到到100,必须调用done方法结束
 NProgress.set(0.4) //核心方法 — sets a percentage, 设置进度条的百分比进度, 可以直接调用跳过调用start,在内部会直接调用start方法
 NProgress.inc()   //— increments by a little ,每点击一次随机地把当前进度条加长一点点
 NProgress.done()  //— completes the progress,主要方法,用于结束进度条状态,标志完成状态
 NProgress.configure({}); //设置参数,在调用程序前,可以自定义具体参数再进行调用
```
下面,我们先看
####NProgress.settings
```javascript
var Settings = NProgress.settings = {
    minimum: 0.08,    //进度变化量? 0.08 * 100 = 8%
    easing: 'linear', //动画函数
    positionUsing: '', //判断支持动画类型 (translate3d,translate,margin)
    speed: 200,        //动画速度
    trickle: true,     //不断执行
    trickleSpeed: 200, //执行间隔
    showSpinner: true, //显示进度条
    barSelector: '[role="bar"]', //进度条元素
    spinnerSelector: '[role="spinner"]', //转转的那个圈圈元素
    parent: 'body',   //插入位置
    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'//进度条html
  };
```
插件具体的参数全部都定义在了`NProgress.settings`对象中,再新建个变量`Settings`进行短连接引用`NProgress.settings`方便下面的设置方法进行遍历重置自定义参数


#### NProgress.configure({})
该方法为`全局设置参数`的,设置完再调用程序
```javascript
NProgress.configure = function(options) {
    var key, value;
    for (key in options) {
      value = options[key];
      //options.hasOwnProperty(key) 过滤options原型链上的属性,只找属于自己的属性
      if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
    }
    return this; //返回 this 即可 进行链式调用,如:NProgress.configure({}).start(); //设置完马上调用,当时一般是分开写是比较好看点
  };
```
到这里我觉得应该把那些方法内部调用的方法先说比较好,毕竟都是调用他们,不然看主代码会一脸懵逼<(￣3￣)> ,先略过上面说的几个主方法(start,inc,set,done),里面都是调用其他东西的.我们先从简单的入手

####NProgress.isStarted()
返回`status`的状态,如果是属性`number`,表示`已经开始`,非`number`表示`未开始`
```javascript
NProgress.isStarted = function() {
    return typeof NProgress.status === 'number';
  };
```
####NProgress.remove()
在网页中删除`NProgress`
```javascript
//换成jq好理解吧?
//查阅:Document.documentElement 是一个会返回文档对象（document）的根元素的只读属性（如HTML文档的 <html> 元素）。
//$(document.documentElement)[0] ===  $('html')[0] =>true
	removeClass(document.documentElement, 'nprogress-busy'); //$('html').removeClass('nprogress-busy')
    removeClass(document.querySelector(Settings.parent), 'nprogress-custom-parent'); //$(Settings.parent).removeClass('nprogress-custom-parent')
    var progress = document.getElementById('nprogress'); //查找id为nprogress的元素
    progress && removeElement(progress); //如果存在就删除 $('#nprogress').remove()
    
```

####NProgress.isRendered
判断`nprogress`元素是否存在判断是`进度条`是否渲染
```javascript
  /**
   * Checks if the progress bar is rendered.
   */
  NProgress.isRendered = function() {
    return !!document.getElementById('nprogress'); 
  };

```
####工具方法
```javascript
//n为比较值,min:最小值,max:最大值	
//根据判断是 让 n 的范围保证在 ( 0~1) 
  function clamp(n, min, max) {
    if (n < min) return min;  //n 小于 min 返回 min
    if (n > max) return max;  //n 大于 max 返回 max
    return n;
  }
  
  /**
   * (Internal) converts a percentage (`0..1`) to a bar translateX
   * percentage (`-100%..0%`).
   */
   //根据翻译,应该是先设置为负值,再慢慢向右边移动
  function toBarPerc(n) {
    return (-1 + n) * 100;
  } 
  
  //模拟队列
   var queue = (function() {
    var pending = []; //队列数组

    function next() {
      var fn = pending.shift(); //提取第一个元素
      if (fn) { //这里感觉判断不够准确,可能会报错,应该改为
      //if (typeof fn === 'function') 传入可能不一样的function,不过这个是它自己内部用的,所以可能才没有做严格数据验证吧
        fn(next); //归地自调用,知道队列清空为止
      }
    }

    return function(fn) {
      pending.push(fn); //压入
      if (pending.length == 1) next(); //这个判断感觉有点怪怪,都压入到数组了,那长度肯定是1..
      //next() 还不如这样来得痛快
    };
  })();
  //通过调用queue(function(){});
 
  /**
   * (Internal) returns the correct CSS for changing the bar's
   * position given an n percentage, and speed and ease from Settings
   */
   //用来设置bar的长度(进度)
  function barPositionCSS(n, speed, ease) {
    var barCSS;

    if (Settings.positionUsing === 'translate3d') {
      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
    } else if (Settings.positionUsing === 'translate') {
      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
    } else {
      barCSS = { 'margin-left': toBarPerc(n)+'%' };
    }

    barCSS.transition = 'all '+speed+'ms '+ease;

    return barCSS;
  }
 
```
还有个原生css方法我就不理它了...其实就是实现css,这里我就不分析了.那么以上的那几个方法在核心方法里都是调用它们,那么我们先就开始分析核心方法吧

####NProgress.start()

```javascript
  /**
   * Shows the progress bar.
   * This is the same as setting the status to 0%, except that it doesn't go backwards.
   *
   *     NProgress.start();
   *
   */
  NProgress.start = function() {
    if (!NProgress.status) NProgress.set(0); //根据status,空则执行set,非空不执行

    //该方法是为了不断自增
    var work = function() {
      setTimeout(function() {
        if (!NProgress.status) return; // NProgress.inc() 内部依赖 NProgress.status,如果为0的话,会调用 statr ,如果值不为null则表示初始化成功
        NProgress.trickle(); //=> 内部是执行  NProgress.inc()
        work();
      }, Settings.trickleSpeed);
    };

    if (Settings.trickle) work();//根据Settings.trickle判断是否开启自增模式,如果为flash,则需要自己调用set方法进行改变bar的进度条状态

    return this;
  };
```
先判断`NProgress.status`的值,根据set(`n`)参数返回,如果不传则返回 `Settings.minimum`的值`0.1`,那么得看下set方法里面到底是怎么样的
所以上面按流程,怎么运行都要先执行一次set方法.至于上面的work方法可以不执行,回头再看里面的代码,那么现在是确定是start方法其实也是调用了set方法而已,根据`Settings.trickle`判断是否开启自增模式(就是自己慢慢加载)

####NProgress.set() 核心方法
```javascript
 /**
   * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
   *
   *     NProgress.set(0.4);
   *     NProgress.set(1.0);
   */

  NProgress.set() = function(n) { //n 自定义一开始的进度长度范围 0~1
    var started = NProgress.isStarted();  //该方法返回是否有html生成,第一次运行,肯定返回 null 

    n = clamp(n, Settings.minimum, 1);  //上面讲过,根据n, n 小于 min ,返回 min, 大于 1 返回 1,那么这里很明显返回 0.1
    NProgress.status = (n === 1 ? null : n); //设置 status 的数值,很明显是 status = 0.1

    var progress = NProgress.render(!started), //!started => true,直接跳到reander 渲染html,并返回barwrap引用
        bar      = progress.querySelector(Settings.barSelector),//这个才是那个bar,真正动的是这个
        speed    = Settings.speed,      //动画速度
        ease     = Settings.easing;

    progress.offsetWidth; /* Repaint 触发重绘 */

    //队列方法,个人觉得就是一个封闭的区间
    queue(function(next) { // 这个next是 queue方法中传入的,就是 fn = undefined;那也就执行一次这个方法
      // Set positionUsing if it hasn't already been set
      //这里是查看支持那种模式,默认是空的,谷歌浏览器返回`translate3d`和`translate`,ie类的返回`margin`
      if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

      // Add transition
      //设置bar长度
      css(bar, barPositionCSS(n, speed, ease)); 

      if (n === 1) { //进度完成
        // Fade out
        //显示进度条外层
        css(progress, {
          transition: 'none',
          opacity: 1
        });
        
        progress.offsetWidth; /* Repaint 又触发重绘*/
		
        //最后一次动画
        setTimeout(function() {
         //整条渐变消失
          css(progress, {
            transition: 'all ' + speed + 'ms linear',
            opacity: 0
          });
          //删除
          setTimeout(function() {
            NProgress.remove();
            next(); // undefined
          }, speed);
          
        }, speed);
        
      } else {
        setTimeout(next, speed); //第一次运行必定是运行这里,然后就没然后...如果trickle为false,那么这里只执行一次
      }
    });

    return this;
  };
```
怎么说,没看懂`queue`方法表示意义???感觉不知道为毛要么写,反正看不懂,queue好像也只是执行一次,就是必须继续调用set才有用.
####NProgress.render(boolean fromStart)
只执行一次,在初始化的时候
```javascript
  /**
   * (Internal) renders the progress bar markup based on the `template`
   * setting.
   */

  NProgress.render = function(fromStart) { //fromStart 为逻辑型
    if (NProgress.isRendered()) return document.getElementById('nprogress'); //已经渲染,返回元素引用,后面直接不执行

    addClass(document.documentElement, 'nprogress-busy');// 添加标识class

    var progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = Settings.template;

    var bar      = progress.querySelector(Settings.barSelector),
        perc     = fromStart ? '-100' : toBarPerc(NProgress.status || 0), //改变bar进度条长度
        parent   = document.querySelector(Settings.parent), //获得父元素
        spinner; //转转元素

    css(bar, {
      transition: 'all 0 linear',
      transform: 'translate3d(' + perc + '%,0,0)'
    });

    if (!Settings.showSpinner) { //是否现在转转转那个元素,不显示就删除
      spinner = progress.querySelector(Settings.spinnerSelector);
      spinner && removeElement(spinner);
    }

    if (parent != document.body) {//非body 才加class,有点奇葩???
      addClass(parent, 'nprogress-custom-parent');
    }

    parent.appendChild(progress);
    return progress;
  };
```
如果`fromStart`是`真`的话,表示是`初始化`,如果是`假`则设置bar的长度,根据`toBarPerc(NProgress.status || 0)`返回具体长度,根据源码应该是`(-1+.1)*100=-90%`,也就是加载了`10%`

####NProgress.inc()
其实这个方法也是调用`set`方法的,它随机自增靓.

```javascript
/**
   * Increments by a random amount.
   */

  NProgress.inc = function(amount) {
    var n = NProgress.status;   //获取进度值

    if (!n) {	//为空初始化
      return NProgress.start();
    } else if(n > 1) { //大于1 返回
      return;
    } else {
    	//0.01~.99的情况
        //amount => 非调用 done的情况下,这个跟done有点关系.不是用done触发就会根据 n 获取范围值, amount 为传惨,没传就是undefined
      if (typeof amount !== 'number') {
        if (n >= 0 && n < 0.2) { amount = 0.1; }
        else if (n >= 0.2 && n < 0.5) { amount = 0.04; }
        else if (n >= 0.5 && n < 0.8) { amount = 0.02; }
        else if (n >= 0.8 && n < 0.99) { amount = 0.005; }
        else { amount = 0; }
      }
	  //如果done调用,直接返回99.4 ,一会看done方法你就会明白了	
      //n = 1, n:1 + amount:0 > 0.994 
      n = clamp(n + amount, 0, 0.994);   //最大值99.4%
      return NProgress.set(n); //设置进度条
    }
  };
```
####NProgress.trickle()
这个没什么好说的,start里面调用了这个封装,好累...trickle方法其实跟trickle属性参数关系的,如果为`flash`的话,需要自己调用`set`来设置进度条状态,如果为真则会慢慢加载到99.6%的时候停止
等待用户调用`done`方法结束
```javascript
NProgress.trickle = function() {
    return NProgress.inc();
  };
```

####NProgress.done()
```javascript
  /**
   * Hides the progress bar.
   * This is the *sort of* the same as setting the status to 100%, with the
   * difference being `done()` makes some placebo effect of some realistic motion.
   *
   *     NProgress.done();
   *
   * If `true` is passed, it will show the progress bar even if its hidden.
   * 如果参数为`true`,尽管它是隐藏的都会显示出来
   *     NProgress.done(true);
   */

  NProgress.done = function(force) { //force 为真好像也没什么变化
    if (!force && !NProgress.status) return this;
    return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
  };
```
感觉有些方法写得有点夸张,不知道高手写代码都是这样的吧- -,新手表示很难看到xxx模式,看得好累.
最后我会把这个js改出个jq版本,把作业复杂的东西改一改,希望加深理解.还有一个模拟promise的方法没讲,让`NProgress`支持异步方式调用的吧

####NProgress.promise($promise)
官网也没介绍这东西怎么用...先这样吧.
```javascript
  /**
   * Waits for all supplied jQuery promises and
   * increases the progress as the promises resolve.
   *
   * @param $promise jQUery Promise
   */
  (function() {
    var initial = 0, current = 0;

    NProgress.promise = function($promise) { //传入一个$promise 对象
      if (!$promise || $promise.state() === "resolved") { //完成后返回`NProgress`
        return this;
      }

      if (current === 0) {
        NProgress.start();
      }

      initial++;
      current++;

      $promise.always(function() {
        current--;
        if (current === 0) {
            initial = 0;
            NProgress.done();
        } else {
            NProgress.set((initial - current) / initial);
        }
      });

      return this;
    };

  })();

```


