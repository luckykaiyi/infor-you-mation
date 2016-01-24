var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (!username) {
        res.send({'error': 'username not found'});
        return;
    }
    if (!password) {
        res.send({'error': 'password not found'});
        return;
    }
    
    client.get('user:' + username + ':id', function(err, reply) {
        if (err) {
            res.send({'error': err});
            return;
        }
        if (reply) {
            res.send({'error': 'username: ' + username + " already exists"});
            return;
        } 
        client.incr('user:nextid', function(err, newid) {
            if (err) {
                res.send({'error': err});
                return;
            }
            client.mset(['user:' + newid + ':username', 
                username,
                'user:' + newid + ':password',
                password,
                'user:' + username + ':id',
                newid], 
                function(err) {
                    if (err) {
                        res.send({'error': err});
                        return;
                    }
                    res.send({'msg': 'register ok'});
            });
        });
    });
});

router.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    client.get('user:' + username + ':id', function(err, id) {
        if (err) {
            res.send({'error': err});
            return;
        }
        if (!id) {
            res.send({'error': 'username: ' + username + ' not found'});
            return;
        }
        client.get('user:' + id + ':password', function(err, reply) {
            if (password == reply) {
                res.send({'msg': 'login ok'});
            } else {
                res.send({'error': 'password error'});
            }
        });
    });
});

module.exports = router;