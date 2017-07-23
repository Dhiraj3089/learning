const Promise = require("bluebird");

let receiveStatusObj = {
    test: {
        status: true,
        count: 0
    },
    asd: {
        status: true,
        count: 123
    }
};

var arr = [];


function test() {
    let statsArray = Object.keys(receiveStatusObj).map(key => ({
        key: key, data: receiveStatusObj[key]
    }));

    
    return new Promise((resolve, reject) => {
        Promise.map(statsArray , function (entityName) {
            return function () {
                return new Promise(function (inresolve, inreject) {
                //    console.log(entityName.key,entityName.data)
                    inresolve(entityName.key);
                });
            }();
        }, {
            concurrency: 4
        }).then(function (data) {
            resolve(data);
        });
    });
}

test().then(data => {console.log(data); });