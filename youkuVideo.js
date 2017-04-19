/**
 * Created by yyman001 on 2017/4/19.

 优酷视频获取mp4/flv

 调用
 youkuVideo
 .getVideo({"id":"XMTc2NjQwODI4OA=="})
 .then(function (msg) {
		console.log('msg:', msg);
 });

 参数:id  => 视频id
 segs => 视频类型 [ 目前只支持 mp4,flv ]

 */

;(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.youkuVideo = factory(); //NProgress 在不支持模块支持情况下,全局抛出的变量名
		//即最原始的js调用方式,使用NProgress.xx方法进行调用
	}

})(this, function () {  //this => windows
//核心代码写在这里
	var youkuVideo;
	youkuVideo = {
		baseUrl: "http://static.m3guo.com/video/videoplayer/Default.aspx?",
		videoUrl: '',
		videoId: 0,
		pic: '',
		data: {
			id: 0,
			segs: 'mp4'
		},
		timeout: 3000,
		msg: {},
		getVideo: function (data) {
			var target = this;
			if (data && Object.prototype.toString.call(data) === '[object Object]') {
				target.data = $.extend({}, target.data, data);
				target.videoId = target.data.id;
			}

			console.log('target.data:', target.data);

			var $d = $.Deferred();
			$.ajax({
				type: "GET",
				url: target.baseUrl,
				data: target.data,
				dataType: 'xml',
				cache: false,
				timeout: target.timeout,
				beforeSend: function () {
				}
			}).done(function (xml) {

				if (xml === null) {
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
				$d.resolve(target.msg);

			}).fail(function () {
				$d.reject('请求失败');
			});

			return $d.promise();

		},
		getMP4: function (videoId) {
			var data = null;
			if (videoId && Object.prototype.toString.call(videoId) === '[object Object]') {
				if (typeof videoId.id !== 'undefined' && videoId.id.length) {
					data = $.extend({}, data, videoId);
				} else {
					return $.Deferred().reject('参数不正确!正确参数eg:=> id:[XMTc2NjQwODI4OA==],segs:[mp4/flv]');
				}

			} else if (videoId && Object.prototype.toString.call(videoId) === '[object String]') {
				data = {
					id: videoId
				}
			}
			return this.getVideo(data)
		}
		, getFlv: function (videoId) {
			return this.getVideo({id: videoId, segs: 'flv'})
		}
	};
	return youkuVideo; //记得返回该对象
});