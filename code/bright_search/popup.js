chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "initSearcher") {
     // Get query.
     let query = document.getElementById("query").value;

     this.matchers = [query]
     if (document.getElementById("enable_auto_correction").checked) {
       var corrected = getAutoCorrected(query);
       if (corrected != "" && corrected != query) {
         this.matchers.push(corrected);
       } 
     }
     if (document.getElementById("enable_stemming").checked) {
       var stemming = getStemming(query);
       if (stemming != "" && stemming != query) {
         this.matchers.push(stemming);
       } 
     }
     if (document.getElementById("enable_synonym").checked) {
       var synonyms = getSynonyms(query);
       synonyms.forEach((word) => {
         if (word != query && word != "") {
           this.matchers.push(word); 
         }
       })
     }

     document.getElementById("terms-holder").innerHTML = "Will search for: " + this.matchers.join(", ");

     this.target = -1;

     sendResponse({matchers: this.matchers});

  }

  else if (request.action == "next") {
    document.getElementById("message").innerHTML = "";

    this.target += 1;

    if (this.target >= request.total_number) {
      this.target = request.total_number - 1;
      document.getElementById("message").innerHTML = "Already last one";
    }

    if (this.target < 0) {
      this.target = 0;
    }

    sendResponse({target: this.target, matchers: this.matchers});

  }

  else if (request.action == "previous") {
    document.getElementById("message").innerHTML = "";

    this.target -= 1;

    if (this.target < 0) {
      this.target = 0;
      document.getElementById("message").innerHTML = "Already first one";
    }

    sendResponse({target: this.target, matchers: this.matchers});
  }
});

function initSearch() {
  // Call init searcher and insert search anchors
  var main_page_source = document.documentElement.outerHTML;
  chrome.runtime.sendMessage({action: "initSearcher", main_page_source: main_page_source}, (response) => {
    console.log(response);
    
    var elements = document.body.getElementsByTagName("*");
    var leaf_elements = new Array();

    for (var i = 0; i < elements.length; i++) {
      // console.log(elements[i].nodeName)
      if (!["A", "P", "LI", "CODE", "H1", "H2", "H3", "H4", "H5", "H6"].includes(elements[i].nodeName)) {
        continue;
      }
      if (elements[i].children.length == 0) {
        leaf_elements.push(elements[i]);
      }
    }

    response.matchers.forEach((matcher) => {
      // leaf_elements.forEach((elem) => {console.log(elem.innerHTML)});
      var re = new RegExp(matcher, "gi");
      for (var i = 0; i < leaf_elements.length; i++) {
        if (leaf_elements[i].innerHTML.includes('bs-search-anchors')) {
          continue;
        }
        leaf_elements[i].innerHTML = 
          leaf_elements[i].innerHTML.replace(re, "<span class='bs-search-anchors' style='background:yellow'>" + matcher + "</span>");
      }
    });      
  });
}

function handlePrevClick() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.scripting.executeScript(
            {target: {tabId: tabs[0].id}, func: 

() => {
chrome.runtime.sendMessage({action: "previous"}, (response) => {
    console.log("prev: ", response);
    if (document.getElementsByClassName("bs-search-anchors").length > response.target) {
      document.getElementsByClassName("bs-search-anchors")[response.target].scrollIntoView(true);
    }
});
}

            }, () => {});
  });
}

function handleNextClick() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.scripting.executeScript(
            {target: {tabId: tabs[0].id}, func: 

() => {
total_number = document.getElementsByClassName("bs-search-anchors").length;
chrome.runtime.sendMessage({action: "next", total_number: total_number}, (response) => {
    console.log(response);
    if (document.getElementsByClassName("bs-search-anchors").length > response.target) {
      document.getElementsByClassName("bs-search-anchors")[response.target].scrollIntoView(true);
    }
});
}

            }, () => {});
  });
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
