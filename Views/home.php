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
			<?php include 'js/app.js' ?>
		</script>
	</body>

</html>