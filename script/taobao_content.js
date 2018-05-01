chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "getTaobao") {
            $.ajax({
              url: "https://resource.taobao.com/resource/query",
              type: "GET",
              data: request.res,
              success: function(result){
                var data = {};
                if (result.errorCode===0) {
                  data = result.data;
                } else if (result.errorCode===10) {
                  data = {
                    error: true,
                    msg: '请登录淘宝！'
                  }
                } else {
                  data = {
                    error: true,
                    msg: '获取商品列表出错'
                  }
                }
                chrome.extension.sendMessage({
                  action: 'setTaobao',
                  res: data,
                });
              }
            });
          }
    }
)