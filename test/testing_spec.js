require('babel-register');
require('babel-polyfill');

import promise from 'bluebird';
import mock from 'mock-require';
import chai from 'chai';
let expect = chai.expect;
import sinon from  "sinon";
import sinonChai from  "sinon-chai";
chai.use(sinonChai);

describe("Testing",()=>{
    let TestClass, testingClasssObj;
    before(() => {
        TestClass = require('./../testing');
    });

    beforeEach(() => {
        testingClasssObj = new TestClass();
    });
    after(() => {
        mock.stopAll();
    });

    describe('testingImport',()=>{
        it('testingImport', (done) => {
            expect(testingClasssObj.testingImport()).to.be.eql("testing");
            done();
        });      
    });
});