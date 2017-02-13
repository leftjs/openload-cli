#!/usr/bin/env node
import program from 'commander'
import jsonfile from 'jsonfile'
import path from 'path'
import fs from 'fs'
import os from 'os'
import axios from 'axios'
const exec = require('child_process').exec

const req = axios.create({
  baseURL: 'https://api.openload.co/1',
  // timeout: 1000,
  headers: {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
  }
});

const configPath = path.resolve(os.homedir(), '.openload.json')
const {login, key} = fs.existsSync(configPath) && jsonfile.readFileSync(configPath, {throws: false})

function verify(login, key) {
  return req.get(`/account/info?login=${login}&key=${key}`).then(res => (res.data.status === 200))
}

// config sub command, config auth login & key
program
  .version('0.0.1')
  .command('config')
  .description('config auth info')
  .option("-l, --login [login]", "openload api for auth")
  .option("-k, --key [key]", "openload key for auth")
  .action(function({login, key}) {
    if (login && key) {
      verify(login, key).then(result => {
        if (result) {
          jsonfile.writeFile(configPath, {
            login,
            key
          }, {spaces: 2}, (err) => {
            if (err) {
              console.error(err)
            } else {
              console.log(`auth info has been saved into ${configPath} successfully!`)
            }
          })
        } else {
          console.log('please input correct api and key')
        }
      })
    } else if (process.argv.length === 3) {
      exec(`${process.argv.join(' ')} -h`, (err, stdout, stderr) => {
        if (err) throw err
        console.log(stdout)
      })
    } else {
      console.log('please input both api and key')
    }
  })

// link sub command, to get the download link from openload's link
program
  .command('link <url>')
  .description('get download link')
  .action(function(url) {
    if (!login || !key) {
      console.log('please input your auth info by config sub command firstly')
      return
    }
    let file = /(embed|f)\/(.*)\//.exec(url)[2]
    req.get(`/file/dlticket?file=${file}&login=${login}&key=${key}`).then(res => {
      if (res.data.status === 200) return res.data.result.ticket
      else throw new Error(res.data.msg)
    }).then(ticket => {
      return req.get(`/file/dl?file=${file}&ticket=${ticket}`)
    }).then(res => {
      if (res.data.status === 200) return res.data.result.url
      else throw new Error(res.data.msg)
    }).then(url => {
      console.log(url)
    }).catch(err => {
      console.log('A Error happened!')
      console.log(err.message)
    })
  })


program.parse(process.argv)
if (!process.argv.slice(2).length) {
  program.help();
}
