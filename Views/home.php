<!DOCTYPE html>
<html lang="en">

  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?= $title ?></title>
    <style>
      <?php include 'css/style.css' ?>
    </style>
  </head>

  <body>
    <div id="app"></div>
    <script>
      <?php include 'js/router.js' ?>

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
    </script>
  </body>

</html>