import * as axios from "axios";

const GET_PRESIGN_URL =
  "https://hrgvfofszh.execute-api.us-east-1.amazonaws.com/develop/generate-presign-url";

function getSignedUrl() {
  const url = `${GET_PRESIGN_URL}`;
  const content = { bucket_name: "wc-ingest-tool", file_name: "testfile.file" };
  const config = { headers: { "Content-Type": "application/json" } };
  return axios.put(url, content, config).then(x => x.data);
}

function upload(formData, presignedUrl) {
  console.log(presignedUrl);
  console.log(formData);

  const url = presignedUrl;

  return (
    axios
      .put(url, formData)
      // get data
      .then(x => x.data)
      // add url field
      .then(x => x.map(f => Object.assign({}, f, { url: presignedUrl })))
  );
}

export { getSignedUrl, upload };
