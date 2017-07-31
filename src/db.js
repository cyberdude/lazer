'use strict'

const Datastore = require('nedb')

var db = {}
db.sessions = new Datastore({ filename: './db/sessions.db', autoload: true })
db.projects = new Datastore({ filename: './db/projects.db', autoload: true })

db.projects.loadDatabase()
db.sessions.loadDatabase()
console.log('this loaded')
module.exports = db
