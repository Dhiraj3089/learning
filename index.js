require('babel-register');
require('babel-polyfill');

import Test from './testing';

class AsyncAwaitRND {
    constructor() {
        ///this.test = new Test();
    }

    testImport() {
        let test = new Test();
        console.log(a, '$$$$$$$$$$$4');
        let a = test.testingImport();

        return a;
    }
    a() {
        return new Promise((resolve, reject) => {
            console.log(`A`);
            resolve("test from a");
            //reject("rejection from A");
        });
    }
    b(a_op) {
        return new Promise((resolve, reject) => {
            console.log(`B`);
            resolve("test from b with appended " + a_op);
            //reject("rejection from B");
        });
    }

    c(b_op) {
        return new Promise((resolve, reject) => {
            console.log(`C`);
            resolve("test from c with appended " + b_op);
            //reject("rejection from C");
        });
    }

    async d() {
        console.log("#####################@4234234234")
            let op = 1;
            op = await this.a();
            op = await this.b(op);
            await this.c(op).then(data => {
                console.log('inside c', data);
                op = "modified in c";
            });
            console.log(op, "outer");
        return "c";
        }
}

module.exports = AsyncAwaitRND;
//let asyncAwait = new AsyncAwaitRND();
//asyncAwait.d();
//let asyncAwait = new AsyncAwaitRND();


/*let asyncAwait = new AsyncAwaitRND();


let executor = async() => {
    let op = 1;
    op = await asyncAwait.a();
    op = await asyncAwait.b(op);
    await asyncAwait.c(op).then(data => {
        console.log('inside c', data);
        op = "modified in c";
    });
    console.log(op, "outer");
    return `${op} -- returning`;
}

let executor1 = () => {
    let op = 1;
    asyncAwait.a().then(data => {
        console.log('inside a', data);
        op = data;
    });
}*/