'use strict';

// let fs = require ('fs');
let https = require ('https');
// const util = require('util');
var log = require('fancy-log');


let subscriptionKey = '796d3d6265a64667a2bc1902c4975bbc';

let host = 'api.cognitive.microsofttranslator.com';
let path = '/translate?api-version=3.0';

let target = 'en';
// let text = 'Mentiría si dijera que era del todo nuevo el sentimiento de que ya no iba a poder ser más que lo que era, que era un hombre que había envejecido más de lo que suponía, que había sospechado tener toda la vida por delante y había ido dejando pasar los años a la espera de que llegara su momento, y ahora la tenía a su espalda. La vida pospuesta para cuando las condiciones fueran favorables. Vivir en una suerte de provisionalidad que le había empujado a aplazarlo todo. Ahora que no tenía futuro alguno, o que éste era una plácida, rutinaria, repetición del presente. Ciertas madrugadas le habían enseñado la serenidad de lo irremediable. Despertarse, ventearse como un perro la vida, ocuparse de sus asuntillos, sacar provecho de ellos, comer, beber, dormir. Ahora, sólo ahora, cuando estaba de verdad solo, sabía que la vida se escapa por las buenas, corre mucho más deprisa de lo que él mismo suponía. Su vida podía resumirse en un apretado rosario de decepciones secretas, de sueños malogrados que había ido disfrazando como había podido, de tentativas más o menos racionales de salir del terreno pantanoso en el que se debatía desde hacía más de quince años: los negocios para los que no estaba capacitado. Siempre en lucha y en desacuerdo consigo mismo, haciendo aquello que en el fondo no quería hacer, simulando un interés por las cosas en las que se ocupaba que estaba muy lejos de tener, hasta convertirse en un fantasma, en una sombra de sí mismo. En ese barullo se le había ido algo más de media vida';

// let params = '?to=' + target;
let params = `&to=${target}`;

let response_handler = function (response) {
    let body = '';
    response.on ('data', function (d) {
        body += d;
    });
    response.on ('end', function () {
        let json = JSON.stringify(JSON.parse(body), null, 4);
        log(json);
        resolve (json)
       
    });
    response.on ('error', function (e) {
        log.error ('Error: ' + e.message);
        reject (e.message)
    });
    
};

let get_guid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let Translate = function (content) {
return new Promise(function(resolve, reject) {
    let body = '';
    log (`Translating`)
    let request_params = {
        method : 'POST',
        hostname : host,
        path : path + params,
        headers : {
            'Content-Type' : 'application/json',
            'Ocp-Apim-Subscription-Key' : subscriptionKey,
            'X-ClientTraceId' : get_guid (),
        }
    };

    let req = https.request (request_params, function (response) {
            response.on ('data', function (d) {
            body += d;
        });
        response.on ('end', function () {
            let json = JSON.stringify(JSON.parse(body), null, 4);
            let json3 = JSON.parse(body)
              
            // console.log(json);
            // console.log("***********************");
            // console.log(`json3[0]`);
            // console.log("***********************");
            resolve (json3)
            // resolve (json3[0].translations[0].text)
        
        });
        response.on ('error', function (e) {
            log.error ('Error: ' + e.message);
            reject (e.message)
        });


    });
    // console.log (`Content ${content}`);
    req.write (content);
    // console.log (response_handler);
    req.end ();
})}

// let content = JSON.stringify ([{'Text' : text}]);

// Translate(content)

module.exports.Translate = Translate;

