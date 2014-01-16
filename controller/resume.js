/*
  #!/usr/local/bin/node
  -*- coding:utf-8 -*-
 
  Copyright 2013 freedom Inc. All Rights Reserved.
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  ---
  Created with Sublime Text 2.
  Date: Jan 10, 2014
  Time: 4:19 PM
  Desc: the controller of resume
 */

var Resume   = require("../proxy").Resume;
var check    = require("validator").check;
var sanitize = require("validator").sanitize;
var resUtil  = require("../lib/resUtil");
var config   = require("../config").config;
var path     = require("path");
var async    = require("async");
var fs       = require("fs");
var execSync = require("execSync");

/**
 * query resume with conditions
 * @param  {Object}   req  the instance of request
 * @param  {Object}   res  the instance of response
 * @param  {Function} next the next handler
 * @return {null}        
 */
exports.query = function (req, res, next) {
    debugCtrller("/controller/resume/query");

    var conditions = {};
    try {
        if (req.body.userName) {
            var userName = sanitize(sanitize(req.body.userName).trim()).xss();
            conditions.userName = userName;
        }
    } catch (e) {
        return res.send(resUtil.generateRes(null, config.statusCode.STATUS_INVAILD_PARAMS));
    }
    
    
    Resume.getResumeWithConditions(conditions, function (err, result) {
        if (err) {
            return res.send(resUtil.generateRes(null, err.statusCode));
        }

        debugCtrller(result);
        return res.send(resUtil.generateRes(result, config.statusCode.STATUS_OK));
    });
};

/**
 * upload resume
 * @param  {Object}   req  the instance of request
 * @param  {Object}   res  the instance of response
 * @param  {Function} next the next handler
 * @return {null}        
 */
exports.upload = function (req, res, next) {
    debugCtrller("/controller/resume/upload");

    var fileName  = req.files.file_source.name || "";
    var tmp_path  = req.files.file_source.path || "";

    try {
        check(fileName).notEmpty();
        check(tmp_path).notEmpty();
        fileName = sanitize(sanitize(fileName).trim()).xss();
        // if (path.extname(fileName).indexOf("zip") === -1) {
        //     throw new InvalidParamError();
        // }
    } catch (e) {
        return res.send(resUtil.generateRes(null, config.statusCode.STATUS_INVAILD_PARAMS));
    }

    var uploadFilePath = path.resolve(__dirname, "../upload/", fileName);
    var transferFilePath = path.resolve(__dirname, "../", config.uncompress_file_path, fileName);

    // var content = fs.readFileSync("/root/resume/bin/resumeanalysis/log/failed/20140116161322.err.log");
    // return res.send(resUtil.generateRes(content, config.statusCode.STATUS_OK));
    
    var shellStdout;

    var mainAnalysisScript = path.resolve(__dirname, "../", config.analysis_mainscript_path);
    var result = existsSync.exec("python {0}".format(mainAnalysisScript));

    debugCtrller(fs.existsSync(result.stdout));
    return res.send(resUtil.generateRes(null, config.statusCode.STATUS_OK));

    // async.series({
    //     renameUploadFile  : function (callback) {
    //         debugCtrller("step renameUploadFile");
    //         fs.rename(tmp_path, uploadFilePath, function (err) {
    //             if (err) {
    //                 debugCtrller(err);
    //                 return callback(new ServerError(), null);
    //             }

    //             callback(null, null);
    //         });
    //     },
    //     pipeHtmlFile      : function (callback) {
    //         debugCtrller("step pipeHtmlFile");
    //         var ext = path.extname(fileName);
    //         if (ext.indexOf("htm") != -1 || ext.indexOf("html") != -1) {
    //             var htmlStream = fs.createReadStream(uploadFilePath);
    //             var newHtmlStream = fs.createWriteStream(transferFilePath);
    //             htmlStream.pipe(newHtmlStream);
    //             return callback(null, null);
    //         } else if (ext.indexOf("zip") != -1) {
    //             var uncompressPath = path.resolve(__dirname, "../", config.uncompress_file_path);
    //             exec("unzip {0} -d {1}".format(uploadFilePath, uncompressPath), 
    //                 function (err, stdout, stderr) {
    //                     if (err || stderr) {
    //                         debugCtrller(err || stderr || "");
    //                         return callback(new ServerError(), null);
    //                     }

    //                     callback(null, null);
    //                 }
    //             );
    //         } else {
    //             return callback(new InvalidParamError(), null);
    //         }
            
    //     },
    //     runShell          : function (callback) {
    //         debugCtrller("step runShell");
    //         var mainAnalysisScript = path.resolve(__dirname, "../", config.analysis_mainscript_path);
    //         exec("python {0}".format(mainAnalysisScript), function (err, stdout, stderr) {
    //             debugCtrller("execed");
    //             if (err || stderr) {
    //                 debugCtrller((err || stderr));
    //                 return callback(new ServerError(), null);
    //             }

    //             shellStdout = stdout;

    //             return callback(null, stdout);
    //         });
    //     },
    //     readLog           : function (callback) {
    //         debugCtrller("readLog");
    //         debugCtrller(shellStdout);
    //         exec("cat " + shellStdout, function (err, stdout, stderr) {
    //             if (err || stderr) {
    //                 debugCtrller((err || stderr));
    //                 return callback(new ServerError(), null);
    //             }

    //             debugCtrller(stdout);
    //             return callback(null, null);
    //         });

    //         // if (shellStdout && fs.existsSync(shellStdout)) {
    //         //     var pathObj = handlerStdoutFilePath(shellStdout);
    //         //     var content = "";

    //         //     if (pathObj && pathObj.err) {
    //         //         content = fs.readFileSync(pathObj.err);
    //         //     } else if (pathObj && pathObj.dup) {
    //         //         content = fs.readFileSync(pathObj.dup);
    //         //     }
                
    //         //     return res.send(resUtil.generateRes(content, config.statusCode.STATUS_OK));
    //         // } else {
    //         //     debugCtrller("not exists");
    //         //     return res.send(resUtil.generateRes("content", config.statusCode.STATUS_OK));
    //         // }
            
    //         // var content = fs.readFileSync("/root/resume/bin/resumeanalysis/log/failed/20140116161322.err.log");
    //         // return res.send(resUtil.generateRes(content, config.statusCode.STATUS_OK));
    //     }
    // },
    // function (err, results) {
    //     debugCtrller("enter callback");
    //     debugCtrller("results : %s", results);
    //     if (err || !results) {
    //         return res.send(resUtil.generateRes(null, err.statusCode));
    //     }

    //     // if (results.runShell) {
    //     //     var filePathStr = results.runShell;
    //     //     debugCtrller(filePathStr);
    //     //     var pathObj = handlerStdoutFilePath(filePathStr);
    //     //     var content = "";

    //     //     if (pathObj && pathObj.err) {
    //     //         content = fs.readFileSync(pathObj.err);
    //     //     } else if (pathObj && pathObj.dup) {
    //     //         content = fs.readFileSync(pathObj.dup);
    //     //     }
            
    //     //     return res.send(resUtil.generateRes(content, config.statusCode.STATUS_OK));
    //     // }

    //     return res.send(resUtil.generateRes(null, config.statusCode.STATUS_OK));
    // });
    
};

/**
 * handle resume analysis script's std out file path
 * @param  {String} stdout        the shell's stdout
 * @return {Object}     the process object
 */
function handlerStdoutFilePath (stdout) {
    if (!stdout) {
        return null;
    }

    var fileArr = stdout.split(" ");
    var result = {};

    for (var i = 0; i < fileArr.length; i++) {
        if (fileArr[i].indexOf("err") != -1 ) {
            result.err = fileArr[i];
        }

        if (fileArr[i].indexOf("dup") != -1) {
            result.dup = fileArr[i];
        }
    }

    return result;
}
