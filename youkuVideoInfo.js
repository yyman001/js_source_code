/**
 * Created by ajex on 2016/8/16.
 */
 //支持 mp4,flv 
var youkuVideoInfo = {};
youkuVideoInfo.youkuURL = "http://static.m3guo.com/video/videoplayer/Default.aspx";
youkuVideoInfo.getVideoInfo = function (id,fun)
{
    youkuVideoInfo.id = id;
    youkuVideoInfo.allURL = youkuVideoInfo.youkuURL + "?id=" + youkuVideoInfo.id + "&segs=mp4";
    var obj = {};
    $.ajax({
        url:youkuVideoInfo.allURL,
        type: 'GET',
        dataType: 'xml',
        timeout: 1000,
        error: function(xml){
//            alert('Error loading XML document'+xml);
            alert("视频播放正忙，请稍后再试……")
        },
        success: function(xml){
            obj.starttype = $(xml.documentElement).attr("starttype");
            obj.label = $(xml.documentElement).attr("label");
            obj.type = $(xml.documentElement).attr("type");
            obj.bytes = $(xml.documentElement).attr("bytes");
            obj.duration =parseInt($(xml.documentElement).attr("duration"))/1000;
            obj.childVideoList = [];
            var list =  $(xml.documentElement).children("u");
            var i;
            for(i = 0;i < list.length;i++)
            {
                var o = {};
                o.bytes = $(list[i]).attr("bytes");
                o.duration = parseInt($(list[i]).attr("duration"))/1000;
                o.src = $(list[i]).attr("src");
                obj.childVideoList.push(o);
            }
            obj.getVideoURL =  obj.childVideoList[0].src;
            obj.displayURL = $($(xml.documentElement).children("logo")[0]).attr("url");
            fun.call(fun,obj);
        }
    });
}