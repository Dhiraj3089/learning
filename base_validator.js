'use strict';
let lodash = require('lodash');
let pg = require("pg");
const Promise = require('bluebird');
const db = require('./promiseCon');
let fs = require('fs');
Promise.config({
    // Enable cancellation
    cancellation: true
});

/**
 *
 *
 * @class BaseValidator
 */
class BaseValidator {

    /**
     * Creates an instance of BaseValidator.
     *
     *
     * @memberOf Validator
     */
    constructor() {
        this.validationRules = require('./validation_rules');
        this.ValidatonQueries = require('./validation_queries');
        this.validateQuerySet = null;
        this.validationRulesSet = null;
        this.clientId = `kunban102`;
        this.batchId = `6983d18f-6d9d-74fd-6d2c-b7073a5da352`,
        this.runId = `6cdf7bc3-f5d5-0712-cd9a-86f1c9783c0c`,
        this.sis = `rdioneroster`;
    }

    validate(asyncFlag) {
        console.log(`Performing ${this.component} validations for batch id : ${this.batchId}`);
        //to do : need to make generic based on sis config.
        this.validationRulesSet = (this.sis === "oneroster" || this.sis === "rdioneroster") ? this.getActiveRules() : this.validationRules.validationRules.rule;
        let vQ = new(this.ValidatonQueries)(this.batchId, this.clientId, this.runId);
        this.validateQuerySet = vQ.getValidationRuleQueries().validationQueries.rule;
        return new Promise((resolve, reject) => {
            if (asyncFlag === true) {
                this.doValidationPromise().then(data=>{
                    resolve(data);
                },err=>{
                    reject(err);
                });
            } else {
                this.doValidationSync(resolve, reject);
            }
        });
    }

    doValidationPromise() {
        let queryObjArr = [];
        return new Promise((resolve, reject) => {
            for (let i in this.validationRulesSet) {
                let element = this.getQueryPromise(this.validationRulesSet[i]);
                queryObjArr.push(element);
            }
            Promise.all(queryObjArr).then(data => {
                resolve("validation passed");
            }, error => {
                queryObjArr.forEach(element => {
                    element.cancel();
                });
                reject(`validation failed: ${error}`);
            }).catch(err =>{
                reject(err);
            });
        })
    }

    doValidation(resolve, reject) {
        let queries = this.validateQuerySet;
        let queryObjArr = [];
        let successfulQueryCounter = 0;
        let self = this;


        this.validationRulesSet.forEach((element) => {
            let queryPromise = this.getQueryPromise(element);
            queryPromise.then(() => {
                successfulQueryCounter++;
                if (successfulQueryCounter === queryObjArr.length) {
                    resolve("validation passed");
                }
            }, error => {
                queryObjArr.forEach(element => {
                    element.cancel();
                });
                reject(`validation failed: ${error}`);
            }).catch(err => {
                console.error(err);
            });
            queryObjArr.push(queryPromise);
        });
    }

    doValidationSync(resolve, reject) {
        let queries = this.validateQuerySet;
        let self = this;
        Promise.mapSeries(self.validationRulesSet, function (elementobj) { //will do the sync operation
            return self.startQueryProcess(elementobj);
        }).then(function (data) {
            resolve("validation passed");
        }, error => {
            reject(`validation failed: ${error}`);
        }).catch(error => {
            reject(`validation failed: ${error}`);
        });
    }

    startQueryProcess(element) {
        let self = this;
        return new Promise((resolve, reject) => {
            let queryPromise = this.getQueryPromise(element);
            queryPromise.then(() => {
                resolve("validation passed");
            }, error => {
                reject(`validation failed: ${error}`);
            }).catch(err => {
                console.error(err);
            });
        });

    }

    getQueryPromise(element) {
        let rule = element.name;
        let ele = element;
        let ruleQuery = this.getRuleQuery(rule);
        let isDependent = element.isDependent;
        return new Promise((resolve, reject, onCancel) => {
            let queryObj;
            let queryConn;
            if (ruleQuery.length > 0) {
                console.log(`Validation starting for ${rule}`);
                db.pool.connect().then((connection,done) => {
                    //console.log(ruleQuery[0].query);
                    fs.writeFile(`queries/${rule}.txt`, ruleQuery[0].query + ';', function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        console.log("The file was saved!");
                    });
                    
                    queryObj = connection.query(ruleQuery[0].query)
                        .then((result) => {
                            db.pool.release(connection);
                            //connection.release();
                            //done();
                            let errCount = (result.rows.length) === 0 ? 0 : result.rows[0].err_count;
                            errCount = (isDependent === true ? result.rows.length : errCount);
                            if (errCount > 0) {
                                if (ele.onError === "ABORT") {
                                    console.error(`ABORTING PROCESS, Validation error for ${rule}, ${ele.message} `);
                                    reject(`${rule} validation failed with ${ele.message}`);
                                    return;
                                }
                                if (ele.onError === "WARN") {
                                    logger.warn(`WARNING, ${rule}, ${ele.message}`);
                                    if (isDependent === true) {
                                        let updateQueries = ruleQuery[0].dependent;
                                        let schoolids = this.getSchoolIdString(result.rows);
                                        this.onAfter(updateQueries, schoolids).then(data => {
                                            resolve(`${rule} validation successful with warning ${ele.message}`);
                                        }, err => {
                                            reject(err);
                                        });
                                    } else {
                                        resolve(`${rule} validation successful with warning ${ele.message}`);
                                    }
                                    return;
                                }
                            }
                            console.log(`Validation passed for ${rule}`);
                            resolve(`${rule} validation successful`);
                        }, error => {
                            reject(error);
                            return;
                        });
                    onCancel(function () {
                        console.error(`${rule} validation aborted`);
                        pg.cancel(connection.connectionParameters, connection, ruleQuery[0].query);
                    });
                });

            }
        });
    }

    getRuleQuery(rule) {
        return lodash.filter(this.validateQuerySet, {
            name: rule
        });
    }

    getActiveRules() {
        return lodash.filter(this.validationRules.validationRules.rule, {
            active: true
        });
    }

    getSchoolIdString(schoolid_list) {
        let schoolids = '';
        for (let i = 0; i < schoolid_list.length; i++) {
            schoolids = schoolids + "'" + schoolid_list[i]["id"] + "',";
        }
        return schoolids.slice(0, -1); //
    }

    onAfter(updateQueryList, school_id) {
        let updateCount = updateQueryList.length;
        return new Promise((resolve, reject) => {
            updateQueryList.forEach(ele => {
                let query = ele.query.replace('%value%', school_id);
                console.log(`Updating table ${ele.table} with ti_process_type ${ele.flag}`);

                db.pool.connect().then(connection => {
                    connection.query(query, (err, result) => {
                        connection.release();
                        if (err) {
                            reject(err);
                        } else {
                            console.log(`Successfully updated table ${ele.table} with ti_process_type ${ele.flag}`);
                            updateCount--;
                            if (updateCount === 0)
                                resolve(`Done`);
                        }
                    });
                });
            });

        });

    }
}

module.exports = BaseValidator;