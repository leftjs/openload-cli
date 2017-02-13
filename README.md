# openload-cli
A cli for openload api, by this, you can easy get the download link from openload's url

## install

1. npm
```bash
npm install -g openload-cli
```
2. yarn 
```bash
yarn global add openload-cli
```

## use
```bash
openload config --login [your_login] --key [your_key] 
```
then, you can use link sub command to get the download link from openload's url
such as https://openload.co/embed/-afTchZO5Uk/?wmode=transparent
```bash
openload link [openload's url]
```

## help info
```bash
Usage: openload [options] [command]


  Commands:

    config [options]   config auth info
    link <url>         get download link

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```
