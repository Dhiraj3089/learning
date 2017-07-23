let async = require('asyncawait/async');
let await = require('asyncawait/await');


async function getTrace () {  
  let pageContent
  try {
    pageContent = await fetch('https://trace.risingstack.com', {
      method: 'get'
    })
  } catch (ex) {
    console.error(ex)
  }

  return pageContent
}


getTrace()  
  .then()