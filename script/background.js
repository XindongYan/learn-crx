chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === 'getTaobao') {
            nicai.tabsInfo({ action: 'getTaobao', res: { q: '', __version__: '3.0', resourceType: 'Pic', ...request.res } });
        } else if (request.action === 'setTaobao') {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
                chrome.tabs.sendMessage(tabs[0].id, {action: "setTaobao", res: request.res });
              })
        }
    }
)