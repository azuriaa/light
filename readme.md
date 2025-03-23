# Light
PHP MVC Framework minimalis.

## Prasyarat
1. Server Apache dengan mod_rewrite
2. PHP 8.4 ke atas

## Setup
Front controller berada di ```public/index.php```. Ubah dan arahkan ke root folder project yang ditentukan jika perlu.

```php
// misalnya
require_once '/../project-1/main.php';
```

Lalu atur juga konfigurasi pada ```main.php``` jika diperlukan.
Saat environtment berubah, konfigurasi file tersebut juga perlu diubah.

```php
// Atur zona waktu, misalnya Asia/Jakarta untuk UTC+7
date_default_timezone_set(timezoneId: 'Asia/Jakarta');

// Tampilkan/sembunyikan pesan error, set ke false jika mode production
ini_set(option: 'display_errors', value: true);

// Pengaturan koneksi PDO database untuk Model
$_ENV['DB_DEFAULT'] = [
    'dsn' => 'mysql:dbname=test;host=localhost',
    'username' => 'root',
    'password' => '',
];
```

## Routing
Route dapat diatur pada ```App/AppRouter.php```.

```php
Router::add('/page', function () {
    // benar
});

Router::add('/page-to-something', function () {
    // benar
});

Router::add('/page/to/something', function () {
    // salah, route akan dibaca "pagetosomething"
});

Router::add('/12', function () {
    // salah, route hanya mendukung tipe string
});
```

Cara kerjanya adalah hanya sederhana, hanya mencocokkan string tanpa tanda slash "/", jadi kelemahanya tidak bisa meregister nama route dengan slash. Meski begitu string slash berikutnya akan dijadikan params callback route.
Meskipun callback bisa diisi apapun, namun akan lebih baik jika diarahkan ke controller.

Misalnya URL ```http://localhost/user/example```

```php
Router::add('/user', function ($id = null) {
    Router::controller(User::class, $id); // param pertama controller class, param kedua adalah parameter yang akan dikirim ke controller method
});
```

Hasilnya adalah route ```/user```, dan ```$id``` akan berisi ```example```.

Router akan mencoba memanggil controller sesuai dengan request method.

- ```GET``` dengan ```$id``` null akan memanggil method ```index()```
- ```GET``` dengan ```$id``` terisi akan memanggil method ```show($id)```
- ```POST``` akan memanggil method ```create()```
- ```PUT``` atau ```PATCH``` akan memanggil method ```update($id)```
- ```DELETE``` akan memanggil method ```delete($id)```

## Controller & View
Controller adalah business logic dari aplikasi kita sedangkan
View adalah template halaman HTML, yang defaultnya berada pada direktori ```App/Views/```. Cara memanggilnya seperti di bawah ini.
Misalnya mengirim data ```date``` secara dinamis dari controller untuk dirender pada view.

```php
// App/Controller/UserController
namespace App\Controllers;

use Framework\Controller;

class UserController {
    public function index() {
        $data = [
            'date' => date('d-m-Y')
        ];

        view('dashboard', $data);
    }
}

```

Misalnya view berupa ```App/Views/dashboard.php```:

```php
<?= $date ?>
```

Atau view berupa ```App/Views/dashboard.html```:

```html
{{ date }}
```

Maka data yang berasal dari controller akan ditampilkan.

## Middleware
Middleware adalah perantara request/response menuju business layer, tapi
di PHP middleware biasanya hanya untuk membuat event sebelum dan sesudah mengakses controller yang berada pada direktori misalnya ```app/middlewares/```.

Misalnya, untuk membatasi akses dashboard dengan login session, maka perlu membuat file 
```DashboardMiddleware.php```
kurang lebih seperti di bawah ini.

```php
// App/Middlewares/DashboardMiddleware.php
namespace App\Middlewares;

class DashboardMiddleware
{
    public static function before(): void
    {
        // jika belum login akan di redirect ke halaman login
        session_start();
        if (!$_SESSION['isLoggedIn']) {
            header('Location: http://localhost/login');
            exit(0);
        }
    }

    public static function after(): void
    {
        // ...
    }
}
```

Lalu dapat dipasangkan pada ```App/AppRoute.php```.

```php
// menggunakan controller loader
Router::add('/dashboard', function ($id = null) {
    Router::controller(DashboardController::class, $id, DashboardMiddleware::class);
});

// atau bisa juga secara manual
Router::add('/dashboard', function ($id = null) {
    DashboardMiddleware::before();
    Router::controller(DashboardController::class, $id);
});
```

## Validation

Validation sederhana ini berguna untuk menangani input yang tidak diinginkan. Cara penggunaannya adalah sebagai berikut.

#### Cara Memanggil Validator
```php
// import class nya
use Framework\Validator;
```

#### Validasi Single Data
Berikut adalah cara melakukan validasi untuk 1 data.

```php
$data = [
    'luas' => 88.2,
];

try {
    // param #1 data input
    // param #2 pattern
    // param #3 min
    // param #4 max
    $luas = Validator::validate($data['luas'], 'float', 10, 100);

    echo "luas: $luas";
} catch (\Exception $e) {
    // hasilnya akan exception jika ada yang tidak valid
    echo $e->getMessage();
}
```

#### Validasi Array
Selain cara di atas, cara validasi seperti di bawah ini juga dapat digunakan.

```php
$data = [
    'id' => 19,
    'name' => 'example text: ',
    'value' => 12.5,
];

try {
    $validated = Validator::batchValidate($data, [
        'name' => 'text',
        'value' => 'float|min:12.4 max:13',
        'id' => 'int|min:8 max:100',
    ]);
} catch (\Exception $e) {
    echo $e->getMessage();
}

```

#### Pattern
Optional parameter untuk memilih pattern apa yang akan digunakan sebagai validator.

- alpha
- alphanum (default)
- bool
- date
- email
- float
- int
- ip
- slug
- text
- url

#### Min & Max
Optional untuk batasan suatu data input, jika berupa string maka menjadi panjang string jika integer atau float akan menjadi nilai minimal atau maksimum suatu bilangan.

- nilai min dapat berupa integer atau float (default 0)
- nilai max dapat berupa integer atau float (default 255)

Kedua param ini akan diabaikan untuk pattern bool, date, email, ip dan url.

***Note**: Param min hanya akan bekerja jika param max juga diisi.*

## Koneksi Database
```php
$db = database();
$db->prepare("SELECT * FROM `user` WHERE `id` = ?")->execute(['17']);

$result = $db->fetchAll(PDO::FETCH_ASSOC);
```

#### Menggunakan Database Berbeda
Untuk menggunakan konfigurasi lebih dari 1 pada model,
cukup tambahkan konfigurasi baru pada variabel ```$_ENV```
pada ```main.php```

```php
$_ENV['DB_DEFAULT'] = [
    'dsn' => 'mysql:dbname=test;host=localhost',
    'username' => 'root',
    'password' => '',
];

// Misalnya ini akan digunakan 
$_ENV['CONTOH_DATABASE'] = [
    'dsn' => 'mysql:dbname=example_db;host=192.168.0.2',
    'username' => 'user',
    'password' => 'user123',
];

```

Lalu cukup ubah parameter databasenya seperti di bawah.

```php
$db = database('CONTOH_DATABASE');
```


## Singleton
Membuat instance suatu class menjadi singleton/shared instance.

```php
namespace UserController;

use Framework\Controller
// Import class nya
use Framework\Singleton;
use App\Models\UserModel;

class UserController {
    public function index() {
        // Process A, B, dan C mengusung instance yang sama
        $processA = Singleton::mount(UserModel::class);
        $processB = Singleton::mount(UserModel::class); //shared instance

        // Process D dan E merupakan individual instance
        $processD = new UserModel;
        $processE = new UserModel;
    }
}
```
