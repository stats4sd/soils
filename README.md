# soils

## What is it?
The stack links a number of bespoke odk forms hosted on kobo toolbox to a mysql custom-schema database and a visualisation platform. 
This repository currently is for development purposes and not designed for general use (yet!)



## How to use
*This assumes you already are a member of the stats4SD team and/or have access to associated the gcloud project, as well as gcloud command line*
1. Setup Gcloud environment  
```
$ gcloud components update 
$ gcloud auth application-default login` 
$ gcloud config set project soils-stats4sd
```

2. Setup local assets  
*Commands are carried out with yarn package manager, can also be done in npm*
```
$ yarn install
```

3. *(Optional)* Connect to the remote cloudsql database locally  
*Programme used in repo is windows 64bit version, more downloads can be found* [here](https://cloud.google.com/sql/docs/mysql/sql-proxy)  
```
$.\cloud_sql_proxy_x64.exe -instances="soils-stats4sd:us-central1:soils-1"=tcp:3306
```

4. *(Optional)* Start the server locally  
```
$ node app.js
```
View in http://localhost:8080

5. Deploy to live  
```
gcloud app deploy
```

Project available at https://[YOUR_PROJECT_ID].appspot.com 


## How to replicate/adapt

As mentioned, most of the initial setup information can be found in the [Google Node.js Bookshelf App Tutorial](https://cloud.google.com/nodejs/getting-started/tutorial-app)


#to do (notes for chris)
https://cloud.google.com/sql/docs/mysql/phpmyadmin-on-app-engine


Demo at: http://cc-testing-182712.appspot.com

##Prerequisites 
- Create project
- enable api (https://console.cloud.google.com/flows/enableapi)

https://cloud.google.com/nodejs/getting-started/using-cloud-sql

- setup gcloud mysql instance (named libary-demo)
- connect via gcloud (gcloud init to make sure correct account configured)
- download gcloud connector
- get connection name
$gcloud sql instances describe libary-demo
-> connectionName: soils-stats4sd:us-central1:soils-1


## Testing
$.\cloud_sql_proxy_x64.exe -instances="soils-stats4sd:us-central1:soils-1"=tcp:3306
(leave running)
$ cd .\nodejs-getting-started-master\2-structured-data
node app.js
try curl request from postman to localhost:8080

## Deployment
*Remember each deployment stays live and has to manually be disabled (?)*


## Troubleshooting

### 'could not find default credentials' when running proxy
https://stackoverflow.com/questions/41215667/google-cloud-sql-proxy-couldnt-find-default-credentials

### can't connect google data studio to cloudsql db
Possibly problem with permissions (shouldn't be if on same project but has happened in past)

Alternative, use mysql connector
Need to whitelist various ips used by app scripts (one by one from the edit instance panel in cloud sql)
`
64.18.0.0/20
64.233.160.0/19
66.102.0.0/20
66.249.80.0/20
72.14.192.0/18
74.125.0.0/16
173.194.0.0/16
207.126.144.0/20
209.85.128.0/17
216.239.32.0/19
`
Then refresh the data studio page


Much of this code is based on the excellent Node.js Bookshelf App found at:
https://cloud.google.com/nodejs/getting-started/tutorial-app

mysql root: r5jttlm8EiClPGI9
soils-app: KDXroXtNSu9nLjKD4oiusOZSYSu7SdzN
