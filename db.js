'use strict'

const Datastore = require('nedb')

var db = {}
db.sessions = new Datastore({ filename: './db/sessions.db', autoload: true })
db.sessions.loadDatabase()

module.exports = db
