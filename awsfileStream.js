var AWS = require('aws-sdk');
var fs = require('fs');

var params = {
  Bucket: 'onerosters3',
  Key: 'dkfs/test.txt'
};
var s3 = new AWS.S3();
var file = fs.createWriteStream('text123.txt');
file.on('close', function(){
    console.log('done');  //prints, file created
});
s3.getObject(params).createReadStream().on('error', function(err){
    console.log(err);
}).pipe(file);