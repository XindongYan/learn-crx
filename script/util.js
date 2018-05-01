var ORIGIN = 'http://testapi.nicai360.com';
// var ORIGIN = 'http://api.nicai360.com';
let RenderData = null;
let RenderChildrenLength = 0;
var Nicai = function() {};
var nicai = new Nicai();
Nicai.prototype.getVersion = function() {
  $.ajax({
    url: "https://we.taobao.com/creator/content/list.json",
    type: "GET",
    success: function(result){
      if (result.errorMsg) {
        chrome.extension.sendMessage({
          action: 'setVersion',
          res: {
            error: true,
            msg: result.errorMsg,
          },
        });
      } else {
        $.ajax({
          url: "https://resource.taobao.com/category/tabs?__version__=3.0",
          type: "GET",
          success: function(result1){
            if (result1.errorCode === 0) {
              chrome.extension.sendMessage({
                action: 'setVersion',
              });
            } else if (result1.errorCode === 10) {
              chrome.extension.sendMessage({
                action: 'setVersion',
                res: {
                  error: true,
                  msg: '请登录阿里创作平台！',
                },
              });
            } else {
              chrome.extension.sendMessage({
                action: 'setVersion',
                res: {
                  error: true,
                  msg: result1.message,
                },
              });
            }
          }
        })
      }
    }
  })
}
Nicai.prototype.tabsInfo = function(data){
  chrome.tabs.query({ currentWindow: true }, function (tabs){
    var tab = null;
    for (var i = 0; i < tabs.length; i++) {
      if (/^https:\/\/[a-z]+\.taobao\.com/.test(tabs[i].url)) {
        tab = tabs[i];
        break;
      }
    }
    if (tab) {
      chrome.tabs.sendMessage(tab.id, data);
    } else {
      chrome.tabs.create({
        url: 'https://www.taobao.com',
        active: false,
        index: 0,
      },function (result){
        chrome.tabs.onUpdated.addListener(tabsInfoUpdated);
        function tabsInfoUpdated(tabId, changeInfo, tab){
          if (result.id === tabId && changeInfo.status && changeInfo.status === "complete") {
            chrome.tabs.sendMessage(tabId, data);
            chrome.tabs.onUpdated.removeListener(tabsInfoUpdated);
          }
        }
      });
    }
  });
}
Nicai.prototype.alimamaInfo = function(data){
  chrome.tabs.query({ currentWindow: true }, function (tabs){
    var tab = null;
    for (var i = 0; i < tabs.length; i++) {
      if (/^https?:\/\/[a-zA-Z0-9]+\.alimama\.com/.test(tabs[i].url)) {
        tab = tabs[i];
        break;
      }
    }
    if (tab) {
      chrome.tabs.sendMessage(tab.id, data);
    } else {
      chrome.tabs.create({
        url: 'http://pub.alimama.com/myunion.htm?spm=a219t.7900221/1.1998910419.db9f5f632.6cc0f2fbJH3A8I#!/report/detail/taoke',
        active: false,
      },function (result){
        chrome.tabs.onUpdated.addListener(alimamaInfoUpdated);
        function alimamaInfoUpdated(tabId, changeInfo, tab){
          if (result.id === tabId && changeInfo.status && changeInfo.status === "complete") {
            chrome.tabs.sendMessage(tabId, data);
            chrome.tabs.onUpdated.removeListener(alimamaInfoUpdated);
          }
        }
      })
    }
  });
}
Nicai.prototype.tabsToBuyworld = function(data){
  chrome.tabs.query({ currentWindow: true }, function (tabs){
    var tab = null;
    for (var i = 0; i < tabs.length; i++) {
      if (/https:\/\/we.taobao.com\/creation\/post\?template\=post\&activityId=60/.test(tabs[i].url)) {
        tab = tabs[i];
        break;
      }
    }
    if (tab) {
      chrome.tabs.sendMessage(tab.id, data);
    } else {
      chrome.tabs.create({
        url: 'https://we.taobao.com/creation/post?template=post&activityId=60',
        active: false,
      },function (result){
        chrome.tabs.onUpdated.addListener(buyworldUpdated);
        function buyworldUpdated(tabId, changeInfo, tab){
          if (result.id === tabId && changeInfo.status && changeInfo.status === "complete") {
            chrome.tabs.sendMessage(tabId, data);
            chrome.tabs.onUpdated.removeListener(buyworldUpdated);
          }
        }
      })
    }
  });
}

$.extend({
  Ajax: function(url, data) {
    return new Promise(function (resolve, reject) {
        let ajaxSetting = {
            url: url,
            data: data || {},
            success: function (response) {
                resolve(response);
            },
            error: function () {
                reject("请求失败");
            }
        }
        $.ajax(ajaxSetting);
    });
  }
})

$.extend({ //location => json
  getRequstUrl: function(url){
    const strHref = url.substring(url.indexOf('?')+1).split('&');
    const jsonHref = {};
    for (var i = 0; i < strHref.length;i++) {
      var arr = strHref[i].split('=');
      jsonHref[arr[0]] = arr[1];
    }
    return jsonHref;
  }
})

$.extend({
  rndKey: function(){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let str = '';
    for (var i = 0; i < 20; i++) {
      str += chars.charAt(parseInt(Math.random()*(chars.length + 1)));
    }
    return str;
  }
})
$.extend({
  getRenderData: async function(data){
    const url = 'https://cpub.taobao.com/render.json';
    RenderData = await $.Ajax(url, data);
    if (RenderData.config.formError) {
      var errorMsg = RenderData.config.formError.substring(0, RenderData.config.formError.indexOf('['));
      chrome.extension.sendMessage({
        action: 'publishResult',
        error: true,
        msg: errorMsg || '发布失败！',
      });
      return { error: true };
    } else {
      const jsonHref = $.getRequstUrl(RenderData.config.updateUrl);
      const token = jsonHref._tb_token_;
      return RenderData;
    }
  }
})
Nicai.prototype.submit = function(url, data, task, user, channel_name, publishType) {
  return new Promise(function (resolve, reject) {
    let ajaxSetting = {
      url: url,
      type: "POST",
      data: {
        config: JSON.stringify(data),
      },
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      success: function (response) {
        console.log(response);
        const request = {
          action: 'publishResult',
        }

        var msg = response.config ? response.config.formError : '';
        if (response.config && response.config.children) {
          response.config.children.find(function(item){
            if (item.errMsg) {
              msg = item.label+ ':' + item.errMsg;
            }
          });
        }
        if (msg || response.status !== 'success') {
          request.error = true;
        } else {
          request.res = {
            redirectUrl: response.redirectUrl,
            _id: task._id,
            user_id: user._id,
            publishType,
            taobaoResponse: response,
          }
        }
        request.msg = msg || '发布失败';
        chrome.extension.sendMessage(request);
        if (channel_name && channel_name === '买遍全球') {
          window.close();
        }
        resolve(response);
      },
      error: function () {
        reject("请求失败");
      }
    }
    $.ajax(ajaxSetting);
  });
}

Nicai.prototype.submitToTaobao = async function(res){
  const { user, task, publishType } = res;
  let renderParams = { template: task.formData.template };
  if (task.formData.activityId) {
    renderParams.activityId = task.formData.activityId;
  } else {
    renderParams.from = 'draft';
  }
  if (task.taobao && task.taobao.contentId) {
    renderParams = { id: task.taobao.contentId };
  }
  const renderData = await $.getRenderData(renderParams);
  if (renderData.error) {
    return false;
  }
  const { config } = renderData;
  let url = config.actions.find(item => item.name === publishType).url;
  const newData = config;
  config.children.forEach((item, index) => {
    const newChildren = task.children.find(item1 => item1.name === item.name);
    if (newChildren) {
      newData.children[index].props.value = newChildren.props.value;
    }
  });
  task.children.forEach((item, index) => {
    const thisChildren = newData.children.find(item1 => item1.name === item.name);
    if (!thisChildren) {
      newData.children.splice(index, 0, item);
    }
  });
  const index = newData.children.findIndex(item => item.name === 'body' && item.component === 'AnchorImageList' && item.props.url);
  if (index >= 0) {
    const body = newData.children[index];
    makeDapei(body.props.activityId, body.props.value[0].rawData, function(result) {
      const value0 = resolveResult(result.data);
      newData.children[index].props.value[0] = value0;
      nicai.submit(url, newData, task, user, task.channel_name, publishType);
    });
  } else {
    nicai.submit(url, newData, task, user, task.channel_name, publishType);
  } 
}

function makeDapei(activityId, rawData, cb) {
  var body = {
    "rawData": rawData,
    channelId: activityId,
    channelType: "1",
    refRawdataId: 0,
    refDapeiId: 0,
    contentId: "1",
    activityId: activityId,
    actionLog: JSON.stringify([]),
    preDapeiId: 0
  };
  console.log(body);
  var time = Date.now();
  var appKey = '12574478';
  var token = getToken(document.cookie);
  var data = body;
  var signParams = token + "&" + time + "&" + appKey + "&" + JSON.stringify(data);
  var sign = makeSign(signParams);
  var url = 'https://h5api.m.taobao.com/h5/mtop.taobao.luban.dapei.savedapei/4.0/?jsv=2.4.3&appKey=' + appKey +
  '&t='+ time +'&sign=' + sign + '&api=mtop.taobao.luban.dapei.savedapei&v=4.0&ecode=1&type=originaljson&dataType=jsonp&timeout=15000';

  $.ajax({
    url: url,
    type: "POST",
    contentType: 'application/x-www-form-urlencoded',
    data: {
      data: JSON.stringify(body)
    },
    success: function(result){
      console.log(result);
      setTimeout(function() {
        getDapei({dapeiId: result.data.result}, 1, cb);
      }, 3000);
    },
  });
}

function getDapei(body, tryTimes, cb) {
  var time = Date.now();
  var appKey = '12574478';
  var token = getToken(document.cookie);
  var data = body;
  var signParams = token + "&" + time + "&" + appKey + "&" + JSON.stringify(data);
  var sign = makeSign(signParams);
  var url = 'https://h5api.m.taobao.com/h5/mtop.taobao.luban.dapei.querydapei/1.0/?jsv=2.4.3&appKey=' + appKey +
  '&t='+ time +'&sign=' + sign + '&api=mtop.taobao.luban.dapei.querydapei&v=1.0&ecode=1&type=originaljson&dataType=jsonp&timeout=3000';
  $.ajax({
    type: 'POST',
    url: url,
    contentType: 'application/x-www-form-urlencoded',
    data: { data: JSON.stringify(body) },
    success: function(retult) {
      console.log(retult);
      if (retult.data && retult.data.id) {
        cb(retult);
      } else if (tryTimes < 5) {
        setTimeout(function() {
          getDapei(body, tryTimes + 1, cb);
        }, 2000);
      } else {
        cb(retult);
      }
    },
  });
}

function resolveResult(result) {
 const features = {
      images: [],
      dapeiParams: {
        area: result.area,
        bannerSize: result.size,
      },
      dapeiId: result.id,
    }
    const rawData = JSON.parse(result.rawData);
    const anchors = [];
    for (var i = 1; i < rawData.layers.length; i++) {
      if (rawData.layers[i].type === 8) {
        const item = rawData.layers[i];
        anchors.push({
          data: {
            coverUrl: item.picUrl,
            itemId: item.itemId,
            materialId: "",
            url: 'https://item.taobao.com/item.htm?id=' + item.itemId,
          },
          type: "item",
          x: ((item.width * (item.anchorX / 100) + item.x) / 1200) * 100,
          y: ((item.height * (item.anchorY / 100) + item.y) / 1200) * 100,
        });
      }
    }
    return {
        anchors: anchors,
        features: JSON.stringify(features),
        url: result.url
   }
}
