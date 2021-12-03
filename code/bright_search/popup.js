chrome.runtime.onMessage.addListener(function(request, sender) {
        if (request.action == "searchContent") {
            // Get query and page source.
            let query = document.getElementById("query").value;
            this.pageSource = request.main_page_source;
            var title = this.pageSource.match(/<title[^>]*>([^<]+)<\/title>/)[1];

            // Get BrightSearch options.
            let with_correction = document.getElementById("enable_auto_correction").checked;
            let with_stemming = document.getElementById("enable_stemming").checked;
            let with_synonym = document.getElementById("enable_synonym").checked;

            document.getElementById("debug").innerHTML = query + ", " + with_correction + ", " + with_stemming + ", " + with_synonym + ", " + title;
        }
    });

function searchContent() {
  let main_page_source = document.documentElement.outerHTML;
  chrome.runtime.sendMessage({action: "searchContent", main_page_source: main_page_source});
}

function handleSearch() {
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
            {target: {tabId: tabs[0].id}, func: searchContent}, () => {});
  });
}

document.getElementById("search").addEventListener("click", handleSearch);
