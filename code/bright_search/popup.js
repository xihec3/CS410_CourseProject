chrome.runtime.onMessage.addListener(function(request, sender) {
        if (request.action == "getSource") {
            this.pageSource = request.source;
            var title = this.pageSource.match(/<title[^>]*>([^<]+)<\/title>/)[1];
        document.getElementById("debug").innerHTML = title;
        }
    });

function sendContent() {
  let s = document.documentElement.outerHTML;
  chrome.runtime.sendMessage({action: "getSource", source: s});
}

function handleSearch() {
  let query = document.getElementById("query").value;

  // Add previous and next buttons
  let btn_prev = document.createElement("button");
  btn_prev.innerHTML = "Previous";
  document.getElementById("prev-next").appendChild(btn_prev); 
  let btn_next = document.createElement("button");
  btn_next.innerHTML = "Next";
  document.getElementById("prev-next").appendChild(btn_next);     

  // Remove search
  document.getElementById("search").remove();

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.scripting.executeScript(
            {target: {tabId: tabs[0].id}, func: sendContent}, () => {});
  });
}

document.getElementById("search").addEventListener("click", handleSearch);
