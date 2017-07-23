require('babel-register');
require('babel-polyfill');

import AsyncAwait from './index';

class AsyncCaller {

    async executor() {
        let asyncAwait = new AsyncAwait();
        let op = 1;
        op = await asyncAwait.a();
        op = await asyncAwait.b(op);
        await asyncAwait.c(op).then(data => {
            console.log('inside c', data);
            op = "modified in c";
        });
        return op;
    };
}


module.exports = AsyncCaller;

let asd = new AsyncCaller();
asd.executor()