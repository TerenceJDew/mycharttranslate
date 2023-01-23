const Koa = require('koa')
var Router = require('koa-router')
const json = require('koa-json')
const cors = require('@koa/cors');
const serve = require('koa-better-serve')
var http = require('http');
var https = require('https');
var fs = require('fs');
var enforceHttps = require('koa-sslify');
var log = require('fancy-log');
// const send = require('koa-send');
// const views = require('koa-views');
const Handlebars = require('handlebars');
// const koaBetterBody = require('koa-better-body')
const koaBody = require('koa-body')
// const translationAPI = require ('./translate.js')
const translationAPI = require ('./v3_translate.js')
const Iog = require('iog');
var Base64 = require('js-base64').Base64;
var b64 = require('base-64');
// var utf8 = require('to-utf-8');
var iso88598i = require('iso-8859-8-i');
// var fs = require('fs');
// var enforceHttps = require('koa-sslify');
// var decrypter = require('aes-decrypter').Decrypter;
const parseJson = require('parse-json');
 

const app = new Koa();
var router = new Router();
const logger = new Iog('my-module-name');
var appData = {
 "translationSource" : " ",
 "translationResults" : " ",
 "SourceLanguage": "",
 "RequestURL": ""
}

const config = {
  "httpPort": 3010,
  "httpsPort": 1025 
}

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(koaBody())
  .use(json())
  .use(cors())
  .use(serve('./public'))
  .use(enforceHttps());
  // .use(enforceHttps({
    // trustProtoHeader: true
  // }));
  

router.get ('api','/api/:text', async (ctx,next) => { 
  ctx.body = await pageGenerator ();


} )

router.get ('translate','/translate', async (ctx,next) => { 
 log (`/translate endpoint without params`)
 log (`Request Header`)
 log (ctx.request.header)
 ctx.body = "Empty /translate/ endpoint"

} )


router.get ('encrypt','/encrypt/', async (ctx,next) => { 
  log (`/encrypt endpoint without params`)
  log (`Request Header`)
  log (ctx.request.params)
  log (ctx.request.header)
  log (ctx.request.query)
  ctx.body = "Empty /encrypt/ endpoint"
 
 } )

  router.get ('translate','/translate/:text', async (ctx,next) => {
    try {
    log (`Request received`)
    // log (`Request params: ${ctx.url}`)
    // log (`Text to Decode:' ${ctx.params.text}`)
    // let content2 = Base64.decode(ctx.params.text);
    let decoded = b64.decode (ctx.params.text);
    // log (`Decoded text: ${decoded}`);
    // let decodedTxt = iso88598i.decode (decoded)
    // log (`UTF8 text: ${decodedTxt}`);
    // log (ctx.params);
    // log (ctx.params.text)
    // log (`Request Header`)
    // log (ctx.request.header)
    
    appData.translationSource = decoded  
    // appData.translationSource = decodeURIComponent((ctx.params.text + '').replace(/\+/g, '%20')); 
    
    // let content = JSON.stringify ([{'Text' : appData.translationSource}]);
    let content = JSON.stringify ([{'Text' : decoded}]);
    // log (`Content: ${content}`)
    // let content2 = Base64.decode(content);
    // let content3 = iso88598i.decode (content2);
    // log (`Translated content: ${content2}`)
    // log (`Translated content3: ${content3}`)
    let newText =  await translationAPI.Translate(content)
    let parsedText = JSON.parse (newText[0].translations[0].text)
    appData.translationResults = parsedText[0].Text
    // appData.SourceLanguage=newText[0].detectedLanguage.language
    appData.RequestURL= decoded
    
    
    ctx.body = await pageGenerator ()
    log (`Information sent`)
    }
    catch (error) {
      log.error (error)
    }
  })

// router.get('/translate/public/img/(.*)', async ctx => {
//   serve('./public/img')
// });  

async function pageGenerator () {

  return new Promise ( (resolve, reject) => {

    try {
      var source = `<!DOCTYPE html>
      <html>
      <head>
        <!-- <meta charset="utf-8" /> -->
        <!--[if lt IE 9]><script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.min.js"></script><![endif]-->
        <title>Yale New Haven Health Auto-Translate</title>
        <meta name="keywords" content="" />
        <meta name="description" content="" />
        <link href="../css/style.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet">	
        <script>
        </script>
      </head>
      
      <body>
      
      <div class="wrapper">
      
        <header class="header">
          <img id="hl" src="../img/translate.png" height="60%" width=auto>	
          <strong id="title"> Auto-Translate</strong> 
        </header><!-- .header-->
      
        <div class="middle">
      
          <div class="container">
            <main class="content">
              <strong></strong>
            </main><!-- .content -->
          </div>
      
          <aside class="left-sidebar">
            <strong><h3>Source:</h3></strong> {{translationSource}}
          </aside><!-- .left-sidebar -->
      
          <aside class="right-sidebar">
            <strong><h3>Translation:</h3></strong> {{translationResults}} </aside><!-- .right-sidebar -->
      
        </div><!-- .middle-->
        
        <h5 id="discl"> This is computer generated translation. Please use only as a reference   </h5>
      </div><!-- .wrapper -->
      
      <footer class="footer">
          <img src="../img/YNHHSLogo.png" height=auto width="20%">
        </footer> <!-- .footer -->
      
      </body>
      
      </html>`;
    var template = Handlebars.compile(source);
 
    var result = template(appData);
    resolve (result)
    }

    catch (error) {
      reject (error)

    }

  } )


}

var options = {
  key: fs.readFileSync('cert/server.key'),
  cert: fs.readFileSync('cert/server.crt')
}

// app.listen(config.port, () => console.log(`TranslationApp listening on port ${config.port}`))

http.createServer(app.callback()).listen(config.httpPort);
https.createServer(options, app.callback()).listen(config.httpsPort);
let msgServ = `  Translate application listening on the following ports:
- HTTP : ${config.httpPort}
- HTTPS: ${config.httpsPort}`

// logger.write(msgServ);
log (msgServ)

