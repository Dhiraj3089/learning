require('babel-register');
require('babel-polyfill');

import promise from 'bluebird';
import mock from 'mock-require';
import chai from 'chai';
let expect = chai.expect;
import sinon from "sinon";
import sinonChai from "sinon-chai";
chai.use(sinonChai);

describe("Async Await Test Cases", () => {
    let TestClass, testingImport,
        AsynAwaitClass,
        asynAwaitClassObj;
    before(() => {
        testingImport = sinon.stub().returns("testing");
        TestClass = function () {
            this.testingImport = testingImport
        }
        mock("./../testing", TestClass);
        AsynAwaitClass = require('./../index');

    });
    after(() => {
        mock.stopAll();
    });
    beforeEach(() => {
        asynAwaitClassObj = new AsynAwaitClass();
    });

    describe('Test Import', () => {
        it('Testing mocked test class', done => {

            expect(asynAwaitClassObj.testImport()).to.equal("testing");
            done();
        });
    })

    describe('d', () => {
        it('D#############', async() => {
            
            

            asynAwaitClassObj.d().then(data=>{
                expect(data).to.equal('c');
            });
            
            //console.log(result);
            //done();
        });



    });
});