/**
 * Created by yyman001 on 2017/4/19.

 优酷视频获取mp4/flv

 调用
 qqVideo
 .getVideo({"id":"XMTc2NjQwODI4OA=="})
 .then(function (msg) {
		console.log('msg:', msg);
 });
 视频类型 [ 目前只支持 mp4 ]
 参数:id  => 视频id
 otype =>  返回格式类型 [ json , xml ]

 */

;(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.qqVideo = factory();
  }

})(this, function () {  //this => windows
//核心代码写在这里
  var qqVideo;
  qqVideo = {
    baseUrl: "https://bird.ioliu.cn/v1?",
    videoUrl: '',
    videoId: 0,
    pic: '',
    data: {
      vid: 0,
      otype: 'xml', // json/xml [腾讯的跨域调用,只能用xml]
    },
    timeout: 3000,
    msg: {},
    parseXml: function (data, $d) {
      if (data === null) {
        try {
          $d.reject('视频无法获取');
          throw new Error('视频无法获取!');
        } catch (e) {
          console.log(e);
          new Error(e);
        }
        return;
      }

      target.msg.starttype = $(xml.documentElement).attr("starttype");
      target.msg.label = $(xml.documentElement).attr("label");
      target.msg.type = $(xml.documentElement).attr("type");
      target.msg.bytes = $(xml.documentElement).attr("bytes");
      target.msg.duration = parseInt($(xml.documentElement).attr("duration")) / 1000;
      target.msg.childVideoList = [];
      var list = $(xml.documentElement).children("u");
      var i;
      for (i = 0; i < list.length; i++) {
        var o = {};
        o.bytes = $(list[i]).attr("bytes");
        o.duration = parseInt($(list[i]).attr("duration")) / 1000;
        o.src = $(list[i]).attr("src");
        target.msg.childVideoList.push(o);
      }
      target.msg.videoURL = target.msg.childVideoList[0].src;
      target.msg.pic = $($(xml.documentElement).children("logo")[0]).attr("url");

      //
      target.videoUrl = target.msg.videoURL;
      target.pic = target.msg.pic;
    },
    getVideo: function (data) {
      var target = this;
      var _url = "http://vv.video.qq.com/geturl?vid=" + data.vid + "&otype=" + data.otype + "&platform=1&ran=" + new Date().getTime();
      target.msg.id = data.vid;
      if (data && Object.prototype.toString.call(data) === '[object Object]') {
        //target.data = $.extend({}, target.data, data);
        target.videoId = target.data.vid;
      }


      var $d = $.Deferred();

      $.ajax({
        type: "GET",
        url: target.baseUrl,
        data: {
          url:_url
        },
        dataType: 'jsonp',
        cache: false,
        timeout: target.timeout
      }).done(function (data) {
        var _video = [];
        var tempUrl;

        $(data).find("url").each(function (i, ele) {
          tempUrl = decodeURI(ele.innerHTML).toString();
          if(tempUrl){
            _video.push({"url":tempUrl})
          }
       });

        target.msg.videoURL = _video[0]['url'];
        target.msg.allVideoURL = _video;

        $d.resolve(target.msg);

      }).fail(function () {
        $d.reject('请求失败');
      });

      return $d.promise();

    },
    getMP4: function (videoId) {
      var data = null;
      if (videoId && Object.prototype.toString.call(videoId) === '[object Object]') {
        if (typeof videoId.vid !== 'undefined' && videoId.vid.length) {
          data = $.extend({}, data, videoId);
        } else {
          return $.Deferred().reject('参数不正确!正确参数eg:=> vid:[XMTc2NjQwODI4OA==],otype:[jonp/xml]');
        }

      } else if (videoId && Object.prototype.toString.call(videoId) === '[object String]') {
        data = {
          vid: videoId
        }
      }
      return this.getVideo(data)
    }

  };
  return qqVideo; //记得返回该对象
});
