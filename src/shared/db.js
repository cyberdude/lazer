'use strict'

const Datastore = require('nedb')
const path = require('path')

var db = {}

db.projects = new Datastore({ filename: path.join(__dirname, '../db/projects.db'), autoload: true })
db.sessions = new Datastore({ filename: path.join(__dirname, '../db/sessions.db'), autoload: true })

db.projects.loadDatabase()
db.sessions.loadDatabase()
console.log('this loaded')
module.exports = db
