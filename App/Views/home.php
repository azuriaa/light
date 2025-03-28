<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title><?= $title ?></title>
		<style>
			body {
				font-family: Helvetica;
				text-align: center;
				background-color: white;
				margin: 0;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}

			h1 {
				color: darkcyan;
			}

			p {
				color: black;
				opacity: 50%;
			}

			button {
				border-radius: 10%;
				padding-top: 8px;
				padding-bottom: 8px;
				padding-right: 8px;
				padding-left: 8px;
				border-width: 1px;
				flood-opacity: 0.5;
			}
		</style>
	</head>

	<body>
		<div id="app"></div>
		<script>
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

			class Router {
				static context;
				static routes = {};
				static notFound = "Not Found";

				static refresh() {
					let currentRoute = window.location.hash.replace("#", "");
					if (currentRoute == "") {
						currentRoute = "/";
					}

					if (Router.routes[currentRoute] != undefined) {
						Router.context.innerHTML = Router.routes[currentRoute];
					} else {
						Router.context.innerHTML = Router.notFound;
					}
				}

				static add(route, html) {
					Router.routes[route] = html;
				}

				static start(target) {
					Router.context = document.getElementById(target);
					Router.refresh();
					addEventListener("hashchange", Router.refresh);
				}
			}

			Router.add("/", Index.html());

			Router.start("app");
		</script>
	</body>

</html>