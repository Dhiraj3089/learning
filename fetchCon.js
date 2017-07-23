//
import a from './promiseCon';
const db = require('./promiseCon');
const Promise = require('bluebird');
const bs = require('./base_validator');

let q = `select 1 as a`                       


function test() {
    return new Promise((resolve, reject) => {
        db.getCon().then(connection => {
            connection.query(q, (err, result) => {
                console.log(result);
                connection.release();
            });
        }, err => {
            reject(err);
        }).catch(error => {
            reject(error);
        });
    })
}
function callBS(){
    let baseValidatoe = new bs();
    baseValidatoe.validate(false).then(data=>{
        console.log(data);
    },err=>{
        console.log(err);
    })
}
callBS();
// test().then(data => {
//     console.log(data);
// }, err => {
//     console.log(err);
// });