<template>
  <div id="app">
    <div id="container">
      <!--UPLOAD-->
      <form enctype="multipart/form-data" novalidate v-if="isInitial || isSaving">
        <div id="sb" class="selectbar">
          <select id="ss" name="streamSelect">
            <option class="select-option" v-for="stream in streams">{{ stream }}</option>
          </select>
          <input class="text-box" type="text" value="tag 1">
          <input class="text-box" type="text" value="tag 2">
          <input class="text-box" type="text" value="tag 3">
          <input class="text-box" type="text" value="tag 4">
          <input class="text-box" type="text" value="tag 5">
        </div>
        <div id="db" class="dropbox">
          <input
            type="file"
            multiple
            :name="uploadFieldName"
            :disabled="isSaving"
            @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
            accept="*"
            class="input-file"
          >
          <p v-if="isInitial">Drag files here to begin
            <br>(or)
            <br>Click to browse
          </p>
          <p v-if="isSaving">Uploading {{ fileCount }} files...</p>
        </div>
      </form>
      <!--SUCCESS-->
      <div v-if="isSuccess">
        <h2>Uploaded {{ uploadedFiles.length }} file(s) successfully.</h2>
        <p>
          <a href="javascript:void(0)" @click="reset()">Upload again</a>
        </p>
        <ul class="list-unstyled">
          <li v-for="item in uploadedFiles">
            <img :src="item.url" class="img-responsive img-thumbnail" :alt="item.originalName">
          </li>
        </ul>
      </div>
      <!--FAILED-->
      <div v-if="isFailed">
        <h2>Uploaded failed.</h2>
        <p>
          <a href="javascript:void(0)" @click="reset()">Try again</a>
        </p>
        <pre>{{ uploadError }}</pre>
      </div>
    </div>
  </div>
</template>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<script>
// swap as you need
//import { upload } from "./file-upload.fake.service"; // fake service
import { upload } from "./file-upload.service"; // real service
import { getSignedUrl } from "./file-upload.service";
import { wait } from "./utils";
import axios from "axios";

const STATUS_INITIAL = 0,
  STATUS_SAVING = 1,
  STATUS_SUCCESS = 2,
  STATUS_FAILED = 3;

export default {
  name: "app",
  data() {
    return {
      uploadedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadFieldName: "photos",
      streams: null,
      presignedUrl: null
    };
  },
  computed: {
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isSaving() {
      return this.currentStatus === STATUS_SAVING;
    },
    isSuccess() {
      return this.currentStatus === STATUS_SUCCESS;
    },
    isFailed() {
      return this.currentStatus === STATUS_FAILED;
    }
  },
  methods: {
    reset() {
      // reset form to initial state
      this.currentStatus = STATUS_INITIAL;
      this.uploadedFiles = [];
      this.uploadError = null;
    },
    save(formData) {
      // upload data to the server
      this.currentStatus = STATUS_SAVING;

      getSignedUrl().then(x => {
        this.presignedUrl = x.upload_url;
        upload(formData, this.presignedUrl)
          .then(wait(1500)) // DEV ONLY: wait for 1.5s
          .then(x => {
            this.uploadedFiles = [].concat(x);
            this.currentStatus = STATUS_SUCCESS;
          })
          .catch(err => {
            this.uploadError = err.response;
            this.currentStatus = STATUS_FAILED;
          });
      });
    },
    filesChange(fieldName, fileList) {
      // handle file changes
      const formData = new FormData();

      if (!fileList.length) return;

      // append the files to FormData
      Array.from(Array(fileList.length).keys()).map(x => {
        formData.append(fieldName, fileList[x], fileList[x].name);
      });

      // save it
      this.save(formData);
    }
  },
  beforeMount() {
    axios
      .get(
        "https://hrgvfofszh.execute-api.us-east-1.amazonaws.com/develop/list-user-buckets"
      )
      .then(response => (this.streams = response.data.buckets));
  },
  mounted() {
    this.reset();
  }
};
</script>

<style>
body {
  background-color: rgb(50, 50, 50);
}

#app {
  background-color: rgb(50, 50, 50);
  margin: 50px;
}

#container {
  background: rgb(50, 50, 50);
  width: 70%;
  margin: 0 auto;
  overflow: hidden;
}

#sb {
  background: rgb(50, 50, 50);
  float: left;
  width: 150px;
  margin-bottom: 10px;
  margin-right: 10px;
  margin-left: 10px;
}

.select-option {
  background: rgb(50, 50, 50);
  color: #fff;
}

.text-box {
  background: rgb(50, 50, 50);
  color: #fff;
  width: 145px;
  margin-top: 10px;
}

#db {
  outline: 2px dashed grey; /* the dash box */
  outline-offset: -10px;
  background: lightcyan;
  color: dimgray;
  padding: 10px 10px;
  min-height: 200px; /* minimum height */
  position: relative;
  cursor: pointer;
  margin-left: 170px;
  margin-top: 10px;
}

#ss {
  background: lightgray;
  text-align: right;
  width: 150px;
}

.input-file {
  opacity: 0; /* invisible but it's there! */
  width: 100%;
  height: 200px;
  position: absolute;
  cursor: pointer;
}

.dropbox:hover {
  background: lightblue; /* when mouse over to the drop zone, change color */
}

.dropbox p {
  font-size: 1.2em;
  text-align: center;
  padding: 50px 0;
}
</style>