'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _jsonfile = require('jsonfile');

var _jsonfile2 = _interopRequireDefault(_jsonfile);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var exec = require('child_process').exec;

var configPath = _path2.default.resolve(_os2.default.homedir(), '.openload.json');

var _ref = _fs2.default.existsSync(configPath) && _jsonfile2.default.readFileSync(configPath, { throws: false }),
    login = _ref.login,
    key = _ref.key;

function verify(login, key) {
  return _request2.default.get('/account/info?login=' + login + '&key=' + key).then(function (res) {
    return res.data.status === 200;
  });
}

_commander2.default.version('0.0.1').command('config').description('config auth info').option("-l, --login [login]", "openload api for auth").option("-k, --key [key]", "openload key for auth").action(function (_ref2) {
  var login = _ref2.login,
      key = _ref2.key;


  if (login && key) {
    verify(login, key).then(function (result) {
      if (result) {
        _jsonfile2.default.writeFile(configPath, {
          login: login,
          key: key
        }, { spaces: 2 }, function (err) {
          if (err) {
            console.error(err);
          } else {
            console.log('auth info has been saved into ' + configPath + ' successfully!');
          }
        });
      } else {
        console.log('please input correct api and key');
      }
    });
  } else if (process.argv.length === 3) {
    exec(process.argv.map(function (item) {
      if (process.env.NODE_ENV !== 'production' && item == 'node') {
        return 'babel-node';
      } else return item;
    }).join(' ') + ' -h', function (err, stdout, stderr) {
      if (err) throw err;
      console.log(stdout);
    });
  } else {
    console.log('please input both api and key');
  }
});

_commander2.default.command('link <url>').description('get download link').action(function (url) {
  url = 'https://openload.co/f/-afTchZO5Uk/?wmode=transparent';
  if (!login || !key) {
    console.log('please input your auth info by config sub command firstly');
    return;
  }
  var file = /(embed|f)\/(.*)\//.exec(url)[2];
  _request2.default.get('/file/dlticket?file=' + file + '&login=' + login + '&key=' + key).then(function (res) {
    if (res.data.status === 200) return res.data.result.ticket;else throw new Error(res.data.msg);
  }).then(function (ticket) {
    return _request2.default.get('/file/dl?file=' + file + '&ticket=' + ticket);
  }).then(function (res) {
    if (res.data.status === 200) return res.data.result.url;else throw new Error(res.data.msg);
  }).then(function (url) {
    console.log(url);
  }).catch(function (err) {
    console.log('A Error happened!');
    console.log(err.message);
  });
});

_commander2.default.parse(process.argv);
if (!process.argv.slice(2).length) {
  _commander2.default.help();
}