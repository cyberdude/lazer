<template>
  <div>
  </div>
</template>

<script>
import db from '../../shared/db.js'
import _ from 'lodash'
import moment from 'moment'
import humanizeDuration from 'humanize-duration'
// import { ipcRenderer } from 'electron'

export default {
  name: 'project-page',
  data () {
    return {
    }
  },
  mounted: function () {
    console.log(this.$route)
    this.listLogs()
  },
  methods: {
    listLogs: function () {
      db.sessions
        .find({
          name: this.$route.params.name
          // start : {
          //   $gt: (new Date('2017-07-01T01:00:00.279Z'))
          // }
        })
        .sort({ start: -1 })
        .exec((err, docs) => {
          if (err) {
            return console.log(err)
          }

          var aggregatedTime = []
          var totalTime = 0

          _.each(docs, (doc) => {
            console.log(doc)
            const computedTime = moment(doc.end).diff(doc.start)
            aggregatedTime.push(
              {
                time: computedTime,
                human: humanizeDuration(computedTime),
                start: doc.start,
                end: doc.end
              }
            )

            totalTime += computedTime
          })

          console.log(aggregatedTime)
          console.log(humanizeDuration(totalTime))
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

</style>
