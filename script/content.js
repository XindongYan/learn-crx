var nicaiCrx = document.getElementById('nicaiCrx');
var listeners = ['getTaobao'];

if (nicaiCrx) {
  listeners.forEach(function(item) {
    nicaiCrx.addEventListener(item, function(e) {
      var eventData = {};
      if (e.target.innerText) {
        eventData = JSON.parse(e.target.innerText);
      }
      chrome.extension.sendMessage({
        action: item,
        res: eventData || {},
        tabId: 0,
      });
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  // console.log(request);
  if (nicaiCrx) {
    nicaiCrx.innerText = JSON.stringify(request.res);
    const customEvent = document.createEvent('Event');
    customEvent.initEvent(request.action, true, true);
    nicaiCrx.dispatchEvent(customEvent);
  }
})
