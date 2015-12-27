var express = require('express');
var router = express.Router();
var redis = require('redis');
var Promise = require('bluebird');
client = redis.createClient();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});
/* GET home data */
router.get('/data', function(req, res, next) {
    var config = 10;
    var names = [];
    var joblists = [];
    var jobIds = [];
    var jobTopics = [];
    var jobTitles = [];
    var jobUrls = [];
    var data = [];
    for (var i = 1; i <= config; i++) {
        names.push('topic:' + i + ':name');
        joblists.push(getJobIds('topic:' + i + ':joblist'));
    }
    function getJobIds(keyname) {
        return new Promise(function(resolve, reject) {
            client.zrange(keyname, 0, -1, function(err, reply) {
                resolve(reply);
            })
        })
    } 
    Promise.all(joblists).then(function(value){
        jobIds = value;
        Promise.all([getTopics(), getJobs()]).then(function(){
            for (var i = 0; i < jobTopics.length; i++) {
                data.push({
                    'topic':jobTopics[i],
                    'jobs':[],
                });
            }
            for (var i = 0; i < jobTitles.length; i++) {
                for (var j = 0; j < jobTitles[i].length; j++) {
                    data[i].jobs.push({
                        'title':jobTitles[i][j],
                        'url':jobUrls[i][j],
                    });
                }
            }
            res.json(data);
        })
    })
    function getTopics() {
        return new Promise(function(resolve, reject) {
            client.mget(names, function(err, reply){
                for (var i = 0; i < reply.length; i++) {
                    jobTopics.push(reply[i]);
                } 
                resolve();
            })
        })
    }
    function getJobs() {
        return new Promise(function(resolve, reject) {
            var titleKeyNames = [];
            var urlKeyNames = [];
            for (var i = 0; i < jobIds.length; i++) {
                for (var j = 0; j < jobIds[i].length; j++) {
                    titleKeyNames.push('job:' + jobIds[i][j] + ':title');
                    urlKeyNames.push('job:' + jobIds[i][j] + ':url');
                }
                client.mget(titleKeyNames, function(err, reply) {
                    jobTitles.push(reply); 
                })
                client.mget(urlKeyNames, function(err, reply) {
                    jobUrls.push(reply);
                })
                titleKeyNames = [];
                urlKeyNames = [];
            }
            resolve();
        })
    }

//router.get('/:path', function(req, res, next) {
  //res.render(req.params.path);
//});
});
module.exports = router;
