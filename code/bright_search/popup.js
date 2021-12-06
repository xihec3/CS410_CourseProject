chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "initSearcher") {
     // Get query and page source.
     let query = document.getElementById("query").value;
     this.pageSource = request.main_page_source;
     var title = this.pageSource.match(/<title[^>]*>([^<]+)<\/title>/)[1];

     // Get BrightSearch options.
     this.with_correction = document.getElementById("enable_auto_correction").checked;
     this.with_stemming = document.getElementById("enable_stemming").checked;
     this.with_synonym = document.getElementById("enable_synonym").checked;

     this.matchers = [query]
     if (document.getElementById("enable_auto_correction").checked) {
       var corrected = getAutoCorrected(query);
       if (corrected != "" && corrected != query) {
         this.matchers.push(getAutoCorrected(query));
       } 
     }

     document.getElementById("debug").innerHTML = query + ", " + this.with_correction + ", " + this.with_stemming + ", " + this.with_synonym + ", " + title;
  } else if (request.acion = "next") {
    sendResponse({target: 300, a: this.with_stemming, matchers: this.matchers});
  }
});

function initSearch() {
  // Init by adding an id = "target" element at the beginning of body
  const tag = document.createElement("p");
  tag.textContent = "TEST";
  tag.style.backgroundColor = "yellow";

  document.body.insertBefore(tag, document.body.firstChild);

  // Call init searcher
  var main_page_source = document.documentElement.outerHTML;
  chrome.runtime.sendMessage({action: "initSearcher", main_page_source: main_page_source});

  // Call next for the first time
  chrome.runtime.sendMessage({action: "next", main_page_source: main_page_source}, (response) => {
    console.log(response);
    // Update document.documentElement.outerHTML;


  })
}

function handlePrevClick() {
  document.getElementById("debug").innerHTML = "prev";
}

function handleNextClick() {
  document.getElementById("debug").innerHTML = "next";
}

function handleSearchClick() {
  // Add previous and next buttons
  let btn_prev = document.createElement("button");
  btn_prev.innerHTML = "Previous";
  btn_prev.addEventListener("click", handlePrevClick);
  document.getElementById("prev-next").appendChild(btn_prev); 
  let btn_next = document.createElement("button");
  btn_next.innerHTML = "Next";
  btn_next.addEventListener("click", handleNextClick);
  document.getElementById("prev-next").appendChild(btn_next);     

  // Remove search
  document.getElementById("search").remove();

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.scripting.executeScript(
            {target: {tabId: tabs[0].id}, func: initSearch}, () => {});
  });
}

document.getElementById("search").addEventListener("click", handleSearchClick);
