'use strict'

const {app, Tray, net, Menu} = require('electron')
const path = require('path')
const fetch = require('electron-fetch')
const Datastore = require('nedb')
const moment = require('moment')
const humanizeDuration = require('humanize-duration')
const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: function() { return 'y' },
      mo: function() { return 'mo' },
      w: function() { return 'w' },
      d: function() { return 'd' },
      h: function() { return 'h' },
      m: function() { return 'm' },
      s: function() { return 's' },
      ms: function() { return 'ms' },
    }
  }
})
var db = {}
var clock = 0

db.sessions = new Datastore({ filename: './db/sessions.db', autoload: true })
db.sessions.loadDatabase()

const assetsDirectory = path.join(__dirname, 'assets')

let tray = undefined
let window = undefined

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  createTray()
  checkClockStatus()
})

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'lazer.png'))
  // tray.setTitle('--')

  // const contextMenu = Menu.buildFromTemplate([
  //   {label: 'Quit', type: 'normal', click: () => {
  //     app.quit()
  //   }}
  // ])

  // tray.setContextMenu(contextMenu)
  tray.on('click', (event) => {
    console.log('tray click')

    db.sessions
      .find({})
      .sort({time: -1})
      .limit(1)
      .exec((err, lastDoc) => {

      const isStart = (!lastDoc.length || lastDoc[0].start === false) ? true : false
      const doc = {
        time: new Date(),
        start: isStart
      }

      db.sessions.insert(doc, (err, newDoc) => {
        console.log('newDoc', newDoc)

        if (newDoc.start)
          return startClock(newDoc)

        stopClock()
          
      })

    })
  })
}

const checkClockStatus = () => {

  db.sessions
    .find({})
    .sort({time: -1})
    .limit(1)
    .exec((err, lastDoc) => {

      if (!lastDoc.length || lastDoc[0].start === false)
        return
      
      startClock(lastDoc[0])
  })
}

const startClock = (newDoc) => {
  console.log('tick ')

  const clockCore = () => {
    console.log('t0ck', newDoc)

    const startTime = moment(newDoc.time)
    const now = moment()

    const diff = now.diff(startTime, 'ms')
    console.log('diff', diff)
    const title = shortEnglishHumanizer(
      diff,
      {
        round: true,
        units: ['m']
      }
    )
    tray.setTitle(title)
    
  }
  
  clock = setInterval(clockCore, 60000)
  clockCore()
}

const stopClock = () => {
  clearInterval(clock)
  clock = 0
  tray.setTitle('')
}
