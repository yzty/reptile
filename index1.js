// https://www.jb51.net/article/97659.htm
var http = require("http")
const https = require('https') 
var fs = require("fs")
var cheerio = require("cheerio")
var iconv = require("iconv-lite")
var request = require('sync-request')
var url = 'https://www.biquguan.com/bqg387515/' 

const getList=(callback)=>{
  https.get(url, function(res) { //资源请求
    var chunks = []
    res.on('data', function(chunk) {
      chunks.push(chunk)
    })
    res.on('end', function() {   
      var html = iconv.decode(Buffer.concat(chunks), 'utf-8') //转码操作
        
      var $ = cheerio.load(html, {
        decodeEntities: false
      }) 
       // console.log($)     
      var links = []
      // 获取全部章节链接
	   
      $("#list a").each(function(i, elem) {      
        var link = new Object()
        link.title = $(this).text()
        link.link = 'https://www.biquguan.com' + $(this).attr('href') //补齐 URL 信息
	 
        //if (i > 0) {
         links.push(link)
		//}
      })
      // 章节排序
     //  var linksArr=links.sort(function(a,b){
    //     return parseInt(a.link.split('.html')[0].slice(-3))-parseInt(b.link.split('.html')[0].slice(-3))
    //   })
       // console.log(linksArr)
      fs.writeFile("list1.json", JSON.stringify(links), function(err) {
        if (!err) {
          console.log("写文件成功")
          callback({code:1})
        }
      })
    }).on('error', function() {
      console.log("网页访问出错")
      callback({code:0})
    })
  })
}

const getContent=(chapter)=>{
  console.log(chapter)
  var res = request('GET',chapter.link)
  var html = iconv.decode(res.body, 'utf8') //获取源码   
   
  var $ = cheerio.load(html, {
    decodeEntities: false
  })
   
  var content ='\n'+ $("div#content").text()
  content=content.replace(/　　/g,'\n\xa0\xa0');

  
  if (fs.existsSync('1.txt')) {
    console.log(chapter.title)
    fs.appendFileSync('1.txt', '\n### ' + chapter.title)
    fs.appendFileSync('1.txt', content)
  } else {
    console.log('1'+chapter.title)
    fs.writeFileSync('1.txt', '\n### ' + chapter.title)
    fs.appendFileSync('1.txt', content)
  }
}


//getList((code)=>{
 // if(0){
	//if(code.code==1){
    var urlList = JSON.parse(fs.readFileSync('list1.json', 'utf8'))
     for (let i = 0; i < urlList.length; i++) {
   
      getContent(urlList[i])
    }
 // }

//})