require('dotenv').config();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
const { expect } = require('chai');
const supertest = require('supertest');
const { spawn } = require('child_process');

global.expect = expect;
global.supertest = supertest;

global.seedDB = function(){
  const bat = spawn('cmd.exe', ['/c', 'seeds\\run-seeds.bat']);

  return new Promise((resolve,reject) => {
    bat.stdout.on('data', (data) => {
      if(data.toString().indexOf('INSERT') > -1 ){
        return;
      }

      console.log(data.toString());
    });
    
    bat.stderr.on('data', (data) => {
      reject(new Error(`Script failure ${data.toString()}`))
    });
    
    bat.on('exit', () => {
      console.log('Seeding Completed')
      resolve()
    });
  });
};