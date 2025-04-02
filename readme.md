# Light
PHP Project Boilerplate.

## Prasyarat
1. Server Apache dengan mod_rewrite
2. PHP 8.4 ke atas

## Konfigurasi
Front controller berada di ```/public/index.php```. Ubah dan arahkan ke root folder project yang ditentukan jika perlu.

```php
// misalnya
$path = '/../project-1/';
```

Lalu atur juga konfigurasi pada ```/Config/server.php``` jika diperlukan.
Saat environtment berubah, konfigurasi file tersebut juga perlu diubah.

```php
// Atur zona waktu, misalnya Asia/Jakarta untuk UTC+7
date_default_timezone_set(timezoneId: 'Asia/Jakarta');

// Tampilkan/sembunyikan pesan error, set ke false jika mode production
ini_set(option: 'display_errors', value: true);

// Pengaturan koneksi PDO database
$_ENV['DB_DEFAULT'] = [
    'dsn' => 'mysql:dbname=test;host=localhost',
    'username' => 'root',
    'password' => '',
];
```

## Router
Route dapat diatur pada ```/Config/router.php```.

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
View adalah template halaman HTML, yang defaultnya berada pada direktori ```/Views/```. Cara memanggilnya seperti di bawah ini.
Misalnya mengirim data ```date``` secara dinamis dari controller untuk dirender pada view.

```php
namespace Controllers;

use Libraries\Controller;

class UserController extends Controller {
    public function index() {
        $data = [
            'date' => date('d-m-Y')
        ];

        echo $this->view('dashboard', $data);
    }
}

```

Misalnya view berupa ```/Views/dashboard.php```:

```php
<?= $date ?>
```

Maka data yang berasal dari controller akan ditampilkan.

## Middleware
Middleware adalah perantara request/response menuju business layer, tapi
di PHP middleware biasanya hanya untuk membuat event sebelum dan sesudah mengakses controller yang berada pada direktori misalnya ```/Middlewares/```.

Misalnya, untuk membatasi akses dashboard dengan login session, maka perlu membuat file 
```DashboardMiddleware.php```
kurang lebih seperti di bawah ini.

```php
namespace Middlewares;

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

Lalu dapat dipasangkan pada ```/Config/router.php```.

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

Validation sederhana ini berguna untuk menangani input yang tidak diinginkan. Validator class akan dimuat secara default pada parent class Controller, cara penggunaannya adalah sebagai berikut.

#### Validasi Single Data
Berikut adalah cara melakukan validasi data.

```php
$data = [
    'id' => 19,
    'name' => 'example text: ',
    'value' => 12.5,
];

try {
    $validated = $this->validator->validate($data, [
        'name' => 'text',
        'value' => 'float|min:12.4 max:13',
        'id' => 'int|min:8 max:100',
    ]);
} catch (\Exception $e) {
    echo $e->getMessage();
}

```

#### Pattern
Parameter untuk memilih pattern apa yang akan digunakan sebagai validator.

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

## Model & Koneksi Database
Model dibuat agar alur kerja interaksi ke database menjadi terpola dan terstruktur. Secara default berada pada direktori ```/Models/```, misalnya akan membuat model untuk tabel User maka akan dibuat file ```UserModel.php```

```php
namespace Models;

use Libraries\Model;

class UserModel extends Model
{
    protected string $table = 'users';
    protected string $primaryKey = 'user_id';
}
```

#### Memanggil Model
Contoh penggunaan beberapa method model

```php
use Models\UserModel;

$user = new UserModel;

$user->getAll();
// SELECT * FROM users

$user->find(25);
// SELECT * FROM users WHERE user_id = 25

$user->insert([
    'user_id' => 26,
    'user_name' => 'ExampleUser',
    'user_key' => '#@abc123',
]);
// INSERT INTO users (user_id, user_name, user_key)
// VALUES (26, 'ExampleUser', '#@abc123')

$user->update([
    'user_name' => 'ExampleTestUser2',
    'user_key' => 'aabb',
], 26);
// UPDATE users
// SET user_name = 'ExampleTestUser2', user_key = 'aabb'
// WHERE user_id = 26

$user->delete(26);
// DELETE FROM users WHERE user_id = 26
```

Kelima method di atas merupakan implementasi CRUD yang umum, selebihnya jika memerlukan query lebih kompleks dapat dilakukan dengan cara mengambil konfigurasi koneksinya saja dan menulis query secara manual

```php
$db = $user->connect();
$db
->prepare("SELECT * FROM users WHERE id >= ? ORDER BY user_name DESC")
->execute(['17']);

$result = $db->fetchAll();
```

#### Menggunakan Konfigurasi Berbeda
Untuk menggunakan konfigurasi lebih dari 1,
cukup tambahkan konfigurasi baru pada variabel ```$_ENV```
pada ```/Config/server.php```

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

Lalu cukup ubah parameter confignya seperti di bawah.

```php
namespace Models;

use Libraries\Model;

class UserModel extends Model
{
    protected string $table = 'users';
    protected string $primaryKey = 'user_id';
    protected string $config = 'CONTOH_DATABASE'; // <=== Di sini
}
```

Setiap 1 konfigurasi akan selalu menggunakan koneksi database yang sama, jika memerlukan koneksi lebih dari satu untuk meningkatkan performa, maka buat konfigurasi baru dengan parameter yang sama.

## Singleton
Membuat instance suatu class menjadi singleton/shared instance.

```php
namespace UserController;

use Libraries\Controller;
use Libraries\Singleton;
use Services\UserMail;

class UserController {
    public function index() {
        // Process A, B, dan C mengusung instance yang sama
        $processA = Singleton::mount(UserMail::class);
        $processB = Singleton::mount(UserMail::class); //shared instance

        // Process D dan E merupakan individual instance
        $processD = new UserMail;
        $processE = new UserMail;
    }
}
```