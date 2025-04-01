class Index {
  static count = 0;

  static html() {
    return `
      <h1><?= $title ?></h1>
      <button onclick="Index.button()">Increment</button><br>
      <p id="value"></p>
      `;
  }

  static button() {
    Index.count++;
    document.getElementById("value").innerText = "Count: " + Index.count;
  }
}

Router.add("/", Index.html());

Router.mount("app");