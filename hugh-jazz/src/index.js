console.log("Foo");

const API_URL = "http://100.121.173.96:3000";

async function ping() {
  const result = await fetch(API_URL + "/ping").then((res) => res.json());

  document.body.innerHTML += JSON.stringify(result);
}

ping();
