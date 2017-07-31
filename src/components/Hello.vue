<template>
  <div>
    <ul>
      <li v-for="project in projects">{{project.name}} <a v-on:click="removeProject(project._id)">[ x ]</a></li>
    </ul>
    <form v-on:submit.prevent="onSubmit">
      <label for="new_project">* New Project</label>
      <input name="newProject" v-model="name" id="new_project" required>
      <button>Add Project</button>
    </form>
  </div>
</template>

<script>
import db from '../db.js'
import { ipcRenderer } from 'electron'

export default {
  name: 'projects',
  data () {
    return {
      name: '',
      projects: []
    }
  },
  mounted: function () {
    console.log(db)
    console.log(ipcRenderer)
    ipcRenderer.send('async', 1)
    this.loadDBProjects()
  },
  methods: {
    onSubmit: function () {
      db.projects.insert({
        name: this.name
      }, (err, newDoc) => {
        if (err) {
          return console.log(err)
        }
        this.loadDBProjects()
        this.name = ''
      })
    },
    removeProject: function (id) {
      db.projects.remove({
        _id: id
      }, (err, result) => {
        if (err) {
          return console.log(err)
        }
        this.loadDBProjects()
      })
    },
    loadDBProjects: function () {
      const parent = this

      db.projects.find({}).exec((err, _projects) => {
        if (err) {
          return console.log(err)
        }
        console.log(_projects)
        parent.projects = _projects
      })

      console.log(db)
    },
    addNewProject: function () {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
