 const requestHeader = new XMLHttpRequest();
 const requestMainHeader = new XMLHttpRequest();
 const requestFooterScript = new XMLHttpRequest();
 const requestMetaData = new XMLHttpRequest();
 include('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js');
 requestInfo();
 var articleArray = [];
 let totalRecord = 0;
 let categoryName = "";
 async function requestInfo() {
     this.categoryName = location.href.split("category/")[1].split(".")[0];
     // Layout fragment raw JS without helper library xD, it's a dirty code but that's okay, thanks for inspecting...
     // Request for head tag
     await makeRequest("GET", "/template/head.html").then((data) => {
         let loaderStyle = document.getElementById("loader-style");
         loaderStyle.insertAdjacentHTML("beforeBegin", data);
     })

     // Request for article meta data
     await makeRequest("GET", "/manifest/" + this.categoryName + ".json").then((data) => {
         arrayData = JSON.parse(data);
         this.totalRecord = arrayData.length;
         generateCard(arrayData, "card-row");
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

     //  Request sidebar
     await makeRequest("GET", "/template/sidebar.html").then((data) => {
         let mainSidebar = document.getElementById("main-sidebar");
         mainSidebar.innerHTML = "";
         mainSidebar.innerHTML += data;
     }).then(() => {
         let theUL = document.getElementById("tag-list-ul");
         let tags = [];
         arrayData.forEach((data) => {
             tags.push(...data['tag']);
         })
         tags = [...new Set(tags)].map(v => v.toLowerCase());
         tags.forEach((tag) => {
             theUL.innerHTML += `<li><a href='/tag.html?id=${tag}'>#${tag}</li>`;
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

 // Make http request
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

 // Include js file
 function include(file) {
     let script = document.createElement('script');
     script.src = file;
     script.type = 'text/javascript';
     script.defer = true;
     document.getElementsByTagName('head').item(0).appendChild(script);
 }


 // Generate article card
 function generateCard(arrayVar, divClass) {
     let totalRecord = arrayVar.length;
     let page = location.href.split("page=")[1];
     if (page == undefined || page == "undefined") {
         page = 1;
     }
     if (arrayVar.length < 1) {
         document.getElementById(divClass).innerHTML = "<h2>This is an INVALID tagname.</h2>";
     } else {
         if (arrayVar.length > 40) {
             let startIndex = (page == 1) ? 0 : 40 * (page - 1);
             let endIndex = (arrayVar.length > startIndex + 40) ? startIndex + 40 : startIndex + (arrayVar.length - startIndex);
             arrayVar = arrayVar.slice(startIndex, endIndex);
         }
         arrayVar.forEach((data) => {
             let article = `<div class="col-md-3 mb-3">
                                    <div class="card blog-post-card">
                                        <a href = "/pages/${data.category}/${data.id}.html">
                                            <div style="overflow:hidden">
                                                <img class="card-img-top" 
                                                src = "${(data["thumbnail"]  == undefined )? "/assets/images/placeholder.jpg" : data['thumbnail']}" 
                                                onerror="this.src = '/assets/images/placeholder.jpg';"
                                                >
                                            </div>   
                                            <div class="card-body">
                                                <h5 class="card-title" id="article-title"><a class="theme-link" href="/pages/${data.category}/${data.id}.html">${data['title']}</a></h5>
                                            </div>
                                        </a>
                                    </div>
                                </div>`;
             document.getElementById(divClass).innerHTML += article;
         })
         if (totalRecord > 40) {
             let pagination = ``;
             pagination += `<nav id= "pagination-nav" class="col-12"> <ul class="pagination justify-content-center">`;
             for (let i = 0; i < totalRecord / 40; i++) {
                 pagination += `<li class="page-item ${(parseInt(page) == i+1)?"active":""}"><a href="/category/${this.categoryName}.html?page=${i+1}" class="page-link">${i+1}</a></li>`
             }
             pagination += `</ul></nav>`;
             document.getElementById(divClass).innerHTML += pagination;
         }
     }
 }