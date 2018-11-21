// https://www.jb51.net/article/97659.htm
var http = require("http")
const https = require('https') 
var fs = require("fs")
var cheerio = require("cheerio")
var iconv = require("iconv-lite")
var request = require('sync-request')
var url = 'https://www.yooread.com/3/16174/' 

const getList=(callback)=>{
  https.get(url, function(res) { //资源请求
    var chunks = []
    res.on('data', function(chunk) {
      chunks.push(chunk)
    })
    res.on('end', function() {   
      var html = iconv.decode(Buffer.concat(chunks), 'utf-8') //转码操作
        // console.log(html)
      var $ = cheerio.load(html, {
        decodeEntities: false
      }) 
       // console.log(content)     
      var links = []
      // 获取全部章节链接
      $("#chapterList a").each(function(i, elem) {      
        var link = new Object()
        link.title = $(this).text()
        link.link = 'https://www.yooread.com' + $(this).attr('href') //补齐 URL 信息
        if (i > 0) {
          links.push(link)
        }
      })
      // 章节排序
      var linksArr=links.sort(function(a,b){
        return parseInt(a.link.split('.html')[0].slice(-3))-parseInt(b.link.split('.html')[0].slice(-3))
      })
       // console.log(linksArr)
      fs.writeFile("list.json", JSON.stringify(linksArr), function(err) {
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
   
  var content ='\n'
  $("div#TextContent p").each(function(i,ele){
    content+= ("\n\n")+'\xa0\xa0' + $(this).text()
   
  })
  // var content =($("div#TextContent p").text()).replace(/\ /g, '')
  
  if (fs.existsSync('幻夜行.txt')) {
    console.log(chapter.title)
    fs.appendFileSync('幻夜行.txt', '\n### ' + chapter.title)
    fs.appendFileSync('幻夜行.txt', content)
  } else {
    console.log('1'+chapter.title)
    fs.writeFileSync('幻夜行.txt', '\n### ' + chapter.title)
    fs.appendFileSync('幻夜行.txt', content)
  }
}


getList((code)=>{
  if(code.code==1){
    var urlList = JSON.parse(fs.readFileSync('list.json', 'utf8'))
    // for (let i = 0; i < urlList.length; i++) {
    for (let i = 0; i < 2; i++) {
      getContent(urlList[i])
    }
  }

})