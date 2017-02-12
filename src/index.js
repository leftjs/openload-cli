import program from 'commander'
import jsonfile from 'jsonfile'
import path from 'path'
import fs from 'fs'
import os from 'os'
import req from './request'
const exec = require('child_process').exec


const configPath = path.resolve(os.homedir(), '.openload.json')
const {login, key} = fs.existsSync(configPath) && jsonfile.readFileSync(configPath, {throws: false})

function verify(login, key) {
  return req.get(`/account/info?login=${login}&key=${key}`).then(res => (res.data.status === 200))
}

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
      exec(`${process.argv.map(item => {
        if (process.env.NODE_ENV !== 'production' && item == 'node') {
          return 'babel-node'
        }else return item
        
      }).join(' ')} -h`, (err, stdout, stderr) => {
        if (err) throw err
        console.log(stdout)
      })
    } else {
      console.log('please input both api and key')
    }
  })

program
  .command('link <url>')
  .description('get download link')
  .action(function(url) {
    url = 'https://openload.co/f/-afTchZO5Uk/?wmode=transparent'
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
