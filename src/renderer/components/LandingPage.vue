<template>
  <div>
    <div class="row" id="project_role">
      <div class="column large-12">
        <h3>Projects</h3>
        <ul>
          <li v-for="project in projects" class="row">
            <div class="column medium-4 large-4">
                <!-- :disabled="projectName !== project.name" -->
              <button
                :disabled="projectName !== project.name && projectName.length > 0"
                v-on:click="tickProject(project)">{{ (projectName === project.name) ? 'Stop' : 'Start' }} > </button>
            </div>
            <div class="column medium-4 large-4">
              <router-link
                :to="'/project/' + project.name">{{project.name}}</router-link>
            </div>
            <div class="column medium-4 large-4">            
              <a v-on:click="removeProject(project)">[ x ]</a>
            </div>
            
          </li>
        </ul>
      </div>
    </div>
    <div class="row" id="add_new_project">
      <div class="column large-12">
        <form v-on:submit.prevent="onSubmit">
          <label for="new_project">* New Project</label>
          <input name="newProject" v-model="name" id="new_project" required>
          <button>Add Project</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import db from '../../shared/db.js'
import { ipcRenderer } from 'electron'

export default {
  name: 'projects',
  data () {
    return {
      name: '',
      projects: [],
      timer: '',
      projectName: ''
    }
  },
  mounted: function () {
    console.log(db)
    console.log(ipcRenderer)
    // setTimeout(() => {
    //   console.log('Sending ipcRenderer')
    //   ipcRenderer.send('async', 1)
    // }, 3000)
    this.loadDBProjects()
    this.bindListeners()
    ipcRenderer.send('clockStatusAsk', true)
  },
  methods: {
    tickProject: function (project) {
      ipcRenderer.send('tock', project)
      console.log('Tick project', project)
    },
    bindListeners: function () {
      ipcRenderer.on('tick', (event, arg) => {
        console.log('ARG here', arg)
      })
      console.log('Binding listeners')
      ipcRenderer.on('clockRunning', (event, _projectName) => {
        if (!_projectName) {
          this.projectName = ''
          return
        }
        this.projectName = _projectName
        console.log('clockRunning ARG here', _projectName)
      })
    },
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
    removeProject: function (project) {
      const answer = confirm('Are you sure you want to remove project ', project.name)

      if (!answer) {
        return
      }

      db.projects.remove({
        _id: project._id
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
<style lang="scss" scoped>

ul {
  list-style-type: none;
}

.row {
  > div {
    // text-align: center;
  }
}

#project_role {
  > div {
    ul {
      li {
        // display: none;
        margin-bottom: 10px;

      }
    }
  }
}

#add_new_project {
  margin-top: 30px;
  > div {

  }
}

</style>
