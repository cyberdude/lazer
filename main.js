'use strict'

const {app, Tray, net, Menu} = require('electron')
const path = require('path')
const fetch = require('electron-fetch')
const Datastore = require('nedb')
const moment = require('moment')
const humanizeDuration = require('humanize-duration')
const _ = require('lodash')

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
var contextMenu = {}
var menuItems = [
  {
    label: 'Start', type: 'normal' , click: () => {
      tickClick()
    }
  },
  {
    label: 'Tezos', type: 'radio' , click: () => {
      
    }
  },
  {
    label: 'Winevento', type: 'radio' , click: () => {
      
    }
  },
  {
    label: 'Quit', type: 'normal', click: () => {
      app.quit()
    }
  }
]
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

const listLogs = () => {
  db.sessions
      .find({
        start : {
          $gt: (new Date('2017-07-01T01:00:00.279Z'))
        }
      })
      .sort({start: -1 })
      .exec((err, docs) => {
        console.log(docs)

        var aggregatedTime = [];
        var lastDoc = {}
        var totalTime = 0
        _.each(docs, (doc) => {

          if (!doc.start)
            return lastDoc = doc
          
          const computedTime = moment(lastDoc.time).diff(doc.time)
          aggregatedTime.push(
            {
              time: computedTime,
              human: humanizeDuration(computedTime)
            }
          )

          totalTime+= computedTime

        })

        console.log(aggregatedTime)

        console.log(humanizeDuration((aggregatedTime[0].time +  aggregatedTime[1].time)))
        console.log(humanizeDuration(totalTime))
      })
}

const buildMenu = (isStart) => {

  menuItems[0].label = (isStart) ? 'Stop' : 'Start'
  contextMenu = Menu.buildFromTemplate(menuItems)
  tray.setContextMenu(contextMenu)
}

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'lazer.png'))
  // tray.setTitle('--')

  tray.on('click', (event) => {
    
  })
}

const tickClick = () => {
  console.log('tray click')

  db.sessions
    .find({})
    .sort({start: -1})
    .limit(1)
    .exec((err, lastDoc) => {

    const isStart = (!lastDoc.length || lastDoc[0].end) ? true : false
    
    buildMenu(isStart)

    // _.each(contextMenu.items, (_m) => {
    //   console.log('_m', _m.checked)
    // })
    // const activeMenu = _.find(contextMenu.items, {checked: true })

    var doc = {
      name: 'Tezos'
    }
    console.log('isStart', isStart)
    if (isStart) {
      doc.start = new Date()
    } else {
      return db.sessions.update({ _id: lastDoc[0]._id}, {end: new Date()}, {}, (err, numberReplaced) => {
        console.log(err)
        console.log('numberReplaced', numberReplaced)
        stopClock()      
      })
    }

    db.sessions.insert(doc, (err, newDoc) => {
      console.log('newDoc', newDoc)

      if (newDoc.start)
        return startClock(newDoc)

      stopClock()
        
    })

  })
}

const checkClockStatus = () => {

  db.sessions
    .find({})
    .sort({start: -1})
    .limit(1)
    .exec((err, lastDoc) => {

      if (!lastDoc.length || lastDoc[0].end)
        return buildMenu()
      
      buildMenu(true)

      // console.log(contextMenu.items)
      // console.log(lastDoc[0].label)
      var activeMenu = _.find(contextMenu.items, { label: lastDoc[0].name })
      console.log(activeMenu.checked = true)
      
      startClock(lastDoc[0])
  })
}

const startClock = (newDoc) => {
  console.log('tick ')

  const clockCore = () => {
    console.log('t0ck', newDoc)

    const startTime = moment(newDoc.start)
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
