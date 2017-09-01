<template>
  <div>
    <div class="row">
      <div class="column medium-6 large-6">
        <h1>{{name}}</h1>
      </div>

      <div class="column medium-6 large-6">
        <h1>{{income}}</h1>
      </div>
    </div>

    <div class="row">

      <div class="column medium-6 large-6">
        <label>Start Date</label>
        <datepicker placeholder="Select Date" v-model="start"></datepicker>
      </div>

      <div class="column medium-6 large-6">
        <label>End Date</label>
        <datepicker placeholder="Select Date"  v-model="end"></datepicker>
      </div>

    </div>

    <div class="row" id="add_panel">

      <div class="column large-4">
        <label>Start Date/Time</label>
        <datepicker placeholder="Select Date" v-model="newStart"></datepicker>
        <!-- <select>
          <option v-for="time in times">{{time}}</option>
        </select> -->
        <input placeholder="00:00" v-model="newHourStart">
      </div>
      

      <div class="column large-4">
        <label>End Date/Time</label>
        <datepicker placeholder="Select Date" v-model="newEnd"></datepicker>
        <input placeholder="00:00" v-model="newHourEnd">
      </div>

      <div class="column large-4">
        <button v-on:click="addNewEntry()">Add new</button>
      </div>

    </div>

    <div class="row" id="detail_data">
      <ul>

        <li class="row">
          <div class="column medium-4 large-4">
            Start
          </div>

          <div class="column medium-4 large-4">
            End
          </div>

          <div class="column medium-4 large-4">
            Total Time
          </div>
        </li>
        
        <li class="row" v-for="session in sessions">
          <div class="column medium-4 large-4">
            {{session.startPretty}}
          </div>

          <div class="column medium-4 large-4">
            {{session.endPretty}}            
          </div>

          <div class="column medium-4 large-4">
            {{session.human}}
          </div>
        </li>

      </ul>
    </div>

    <div class="row" id="aggregated_data">
      <div class="column medium-12 large-12">
        Total: {{totalTime}}
      </div>
    </div>

    <div class="row" id="closing_ctas">
      <div class="column medium-12 large-12">
        <router-link :to="'/'">Back</router-link>
      </div>      
    </div>

  </div>
</template>

<script>
import db from '../../shared/db.js'
import _ from 'lodash'
import moment from 'moment'
import humanizeDuration from 'humanize-duration'
import Datepicker from 'vuejs-datepicker'
import accounting from 'accounting'

// import { ipcRenderer } from 'electron'

export default {
  name: 'project-page',
  data () {
    return {
      name: '',
      sessions: [],
      totalTime: '',
      start: moment().startOf('month').toDate(),
      end: new Date(),
      newStart: new Date(),
      newEnd: new Date(),
      newHourStart: '',
      newHourEnd: '',
      income: '',
      times: []
    }
  },
  mounted: function () {
    this.name = this.$route.params.name
    this.listLogs()
    this.generateTimes()
  },
  methods: {
    generateTimes: function () {
      for (var x = 0; x < 24; x++) {
        var _time = (x < 10)
          ? '0' + x.toString()
          : x.toString()

        _time += ':00'

        this.times.push(_time)
      }
      console.log(this.times)
    },
    addNewEntry: function () {
      const formatInputDate = 'Y-MM-DD'

      var _newStart = moment(this.newStart).format(formatInputDate)
      _newStart += 'T' + this.newHourStart
      _newStart = moment(_newStart)

      var _newEnd = moment(this.newEnd).format(formatInputDate)
      _newEnd += 'T' + this.newHourEnd
      _newEnd = moment(_newEnd)

      db.sessions
        .insert({
          name: this.name,
          start: _newStart.toDate(),
          end: _newEnd.toDate()
        }, (err, docs) => {
          if (err) {
            return console.log(err)
          }
          console.log('herheh', docs)
        })
      console.log(_newStart, this.newHourStart)
      console.log(_newEnd, this.newHourEnd)
    },
    listLogs: function () {
      var query = {
        name: this.name,
        start: { $gt: (new Date(moment(this.start).startOf('day').toISOString())) },
        $or: [{end: { $lt: (new Date(moment(this.end).endOf('day').toISOString())) }}, {end: {$exists: false}}]
      }

      console.log(query)

      db.sessions
        .find(query)
        .sort({ start: 1 })
        .exec((err, docs) => {
          if (err) {
            return console.log(err)
          }

          const dateFormat = 'MMM D, Y, H:mm:ss'

          var aggregatedTime = []
          var totalTime = 0

          _.each(docs, (doc) => {
            // console.log(doc)
            const computedTime = moment(doc.end).diff(doc.start)
            aggregatedTime.push(
              {
                time: computedTime,
                human: humanizeDuration(computedTime),
                start: doc.start,
                startPretty: moment(doc.start).format(dateFormat),
                endPretty: moment(doc.end).format(dateFormat),
                end: doc.end
              }
            )

            totalTime += computedTime
          })
          const convertedIncome = (Math.round((totalTime / 1000 / 60 / 60) * 100) / 100) * 80
          this.income = accounting.formatMoney(convertedIncome, '€', 2, '.', ',')
          this.sessions = aggregatedTime
          this.totalTime = humanizeDuration(totalTime, { units: ['h'] })
        })
    }
  },
  watch: {
  // whenever question changes, this function will run
    start: function () {
      this.listLogs()
    },
    end: function () {
      this.listLogs()
    }
  },
  components: {
    Datepicker
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

ul {
  list-style-type: none;
}

#add_panel {
  $thisMargin: 30px;

  padding: 2.5em 0;
  border: 1px solid;
  border-radius: 3px;
  margin-top: $thisMargin;
  margin-bottom: $thisMargin;
}

#detail_data {
  ul {
    li:first-child {
      font-weight: bold;
    }
  }
}

#closing_ctas {
  margin-top: 30px;
  > div {

  }
}
</style>
