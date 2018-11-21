var http = require("http")
var fs = require("fs")
var cheerio = require("cheerio")
var iconv = require("iconv-lite")
var request = require('sync-request')
var urlList = JSON.parse(fs.readFileSync('list2.json', 'utf8'))
// console.log(urlList)
function getContent(chapter) {
  console.log(chapter)
  var res = request('GET',chapter.link)
  var html = iconv.decode(res.body, 'utf8') //获取源码
   
   
  var $ = cheerio.load(html, {
    decodeEntities: false
  })
   
  var content =''
  $("div#TextContent p").each(function(i,ele){
    content+= ("\n\n")+'\xa0\xa0' + $(this).text()
   
  })
  // var content =($("div#TextContent p").text()).replace(/\ /g, '')
 // console.log(content)
   if (fs.existsSync('幻夜行.txt')) {
     console.log(chapter.title)
        fs.appendFileSync('幻夜行.txt', '### ' + chapter.title)
        fs.appendFileSync('幻夜行.txt', content)
      } else {
        console.log('1'+chapter.title)
        fs.writeFileSync('幻夜行.txt', '### ' + chapter.title)
        fs.appendFileSync('幻夜行.txt', content)
      }
}
// for (let i = 0; i < 1; i++) {
for (let i = 0; i < urlList.length; i++) {
  getContent(urlList[i])
}