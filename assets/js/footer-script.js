 const requestHeader = new XMLHttpRequest();
 const requestMainHeader = new XMLHttpRequest();
 const requestFooterScript = new XMLHttpRequest();
 const requestMetaData = new XMLHttpRequest();

 include('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js');
 requestInfo();
 var article = null;
 var articleArray = [];
 var commonTagArticle = [];
 async function requestInfo() {
     // Layout fragment raw JS without helper library xD, it's a dirty code but that's okay, thanks for inspecting...
     // Request for head tag
     await makeRequest("GET", "/template/head.html").then((data) => {
         let loaderStyle = document.getElementById("loader-style");
         loaderStyle.insertAdjacentHTML("beforeBegin", data);
     })

     // Request for article meta data
     await makeRequest("GET", "/manifest/devops.json").then((data) => {
         articleArray = articleArray.concat(JSON.parse(data));
     })
     await makeRequest("GET", "/manifest/blockchain.json").then((data) => {
         articleArray = articleArray.concat(JSON.parse(data));
     })
     await makeRequest("GET", "/manifest/bigdata.json").then((data) => {
         articleArray = articleArray.concat(JSON.parse(data));
     })

     // Request for article meta data
     await makeRequest("GET", "/manifest/programming.json").then((data) => {
         articleArray = articleArray.concat(JSON.parse(data));
         let articleKey = location.href.split(".html")[0].split("/").pop();
         articleArray.forEach((data) => {
             if (data["id"] == articleKey) {
                 article = data;
                 document.getElementsByTagName("title")[0].innerHTML = article["title"];
                 document.getElementById("article-title").innerHTML = article["title"];
                 document.querySelectorAll('[property="og:image"]')[0].setAttribute("content", article['thumbnail'])
             }
         })

         articleArray.forEach((data) => {
             if (commonTagArticle.length < 6) {
                 let union = [...new Set([...data['tag'], ...article['tag']])];
                 if (union.length > 0) {
                     commonTagArticle.push(data)
                 }
             }
         })
     })

     // Request for footer script
     await makeRequest("GET", "/template/script.html").then((data) => {
         let lines = data.split("\n");
         lines.forEach((url) => {
             let script = document.createElement('script');
             script.type = 'text/javascript';
             script.src = url;
             document.body.appendChild(script);
         })
     })

     // Request sidebar
     await makeRequest("GET", "/template/post-sidebar.html").then((data) => {
         let mainSidebar = document.getElementById("main-sidebar");
         mainSidebar.innerHTML = "";
         mainSidebar.innerHTML += data;
     }).then(() => {
         let theUL = document.getElementById("tag-list-ul");
         let tags = article['tag'];
         tags.forEach((tag) => {
             theUL.innerHTML += `<li><a href='/tag.html?id=${tag}'>#${tag}</li>`;
         })
         commonTagArticle.forEach((data) => {
             document.getElementById('post-sidebar-article-row').innerHTML +=
                 `<div class="col-12 post-sidebar-article">
                    <div class="card blog-post-card">
                        <a href="/pages/${data.category}/${data.id}.html">
                            <div style="overflow:hidden">
                                <img class="card-img-top" src="/assets/images/placeholder.jpg" alt= "article thumbnail">
                            </div>
                            <div class="card-body">
                                <h5 class="card-title" class="article-title">
                                    <a class="theme-link" href="/pages/${data.category}/${data.id}.html">${data.title}</a>
                                </h5>
                            </div>
                        </a>
                    </div>
                </div>`;
         })
     })

     // Request for header block
     await makeRequest("GET", "/template/header.html").then((data) => {
         let mainHeader = document.getElementById("main-header");
         mainHeader.innerHTML = "";
         mainHeader.innerHTML += data;
         setTimeout(() => {
             $('#darkmode').attr('checked', true);
             document.getElementById("loader-wrapper").style.display = "none";
             document.body.style.overflowY = "auto";
         }, 1000)
     })
 }

 function makeRequest(method, url) {
     return new Promise(function (resolve, reject) {
         let xhr = new XMLHttpRequest();
         xhr.open(method, url);
         xhr.onload = function () {
             if (this.status >= 200 && this.status < 300) {
                 resolve(xhr.response);
             } else {
                 reject({
                     status: this.status,
                     statusText: xhr.statusText
                 });
             }
         };
         xhr.onerror = function () {
             reject({
                 status: this.status,
                 statusText: xhr.statusText
             });
         };
         xhr.send();
     });
 }

 function include(file) {
     var script = document.createElement('script');
     script.src = file;
     script.type = 'text/javascript';
     script.defer = true;
     document.getElementsByTagName('head').item(0).appendChild(script);
 }