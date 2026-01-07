# Light

PHP Boilerplate.

## Daftar Isi
1. [Persyaratan Sistem](#persyaratan-sistem)
2. [Konfigurasi](#konfigurasi)
3. [Router](#router)
4. [Middleware](#middleware)
5. [Validator](#validator)
6. [Model](#model)
7. [Singleton](#singleton)
8. [View](#view)

##  Persyaratan Sistem

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

## Controller

Controller adalah inti logic dari aplikasi kita sedangkan
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

data dari controller akan ditampilkan.

### Menerima Form Data

Contoh form data pada view

```html
<form method="get">
    Username:
    <input type="text" name="username">
    <button type="submit">Submit</button>
</form>
```

input form dengan nama form ```username``` dapat diterima pada controller seperti di bawah

```php
$username = $this->getVar('username');
```

### Menerima File

Contoh form upload file pada view

```html
<form method="post" enctype="multipart/form-data">
    File:
    <input type="file" name="upload">
    <button type="submit">Submit</button>
</form>
```
file dengan nama form ```upload``` dapat diterima seperti di bawah
```php
$filename = $this->upload->save('upload');
```
```$filename``` akan berisi nama file pada direktori ```/Storage/Upload/```

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

## Validator

Validasi sederhana berguna untuk menangani input yang tidak diinginkan. Validator class akan dimuat secara default pada parent class Controller, cara penggunaannya adalah sebagai berikut.

### Validasi Data

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

### Pattern

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

### Min & Max

Optional untuk batasan suatu data input, jika berupa string maka menjadi panjang string jika integer atau float akan menjadi nilai minimal atau maksimum suatu bilangan.

- nilai min dapat berupa integer atau float (default 0)
- nilai max dapat berupa integer atau float (default 255)

Kedua param ini akan diabaikan untuk pattern bool, date, email, ip dan url.

***Note**: Param min hanya akan bekerja jika param max juga diisi.*

## Model

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

### Memanggil Model

Contoh penggunaan beberapa method model.

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

Kelima method di atas merupakan implementasi CRUD yang umum, selebihnya jika memerlukan query lebih kompleks dapat dilakukan dengan cara mengambil konfigurasi koneksinya saja dan menulis query secara manual.

```php
$db = $user->connect();
$db
->prepare("SELECT * FROM users WHERE id >= ? ORDER BY user_name DESC")
->execute(['17']);

$result = $db->fetchAll();
```

### Menggunakan Konfigurasi Berbeda

Untuk menggunakan konfigurasi lebih dari 1,
cukup tambahkan konfigurasi baru pada variabel ```$_ENV```
pada ```/Config/server.php```.

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
    protected string $config = 'CONTOH_DATABASE'; // <== Di sini
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

## View

Template HTML & JavaScript yang di bind data lalu dirender ke client.

### Elegant CSS Framework

Elegant CSS Framework adalah framework CSS modern yang ringan dan elegan, dibangun dengan JavaScript untuk menginjeksi style secara otomatis. Framework ini menyediakan komponen siap pakai dengan desain yang konsisten.

#### Lokasi Library

```/Views/resources/elegant_framework.js```

#### Load Library

Tambahkan satu baris kode berikut di <head> HTML Anda:
```php
<script><?php include 'resources/elegant_framework.js' ?></script>
```

#### Animation

- ```fade-in```: Animasi fade in
- ```rotate```: Animasi putar

#### Button

```html
<button class="btn btn-blue">Primary</button>
<button class="btn btn-outline">Outline</button>
```

Varian Warna:

- ```btn-blue```
- ```btn-green```
- ```btn-yellow```
- ```btn-red```

#### Card

```html
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Judul Card</h5>
    <p>Konten card</p>
  </div>
</div>
```

#### Circular Progress

Indikator progress berbentuk lingkaran dengan animasi halus.

Penggunaan Dasar:

```html
<div class="circular-progress" data-circular-progress data-value="75"></div>
```

Dengan Atribut:

```html
<div class="circular-progress" 
     data-circular-progress
     data-value="50"
     data-max="100"
     data-color="blue"
     data-size="large">
</div>
```

Dengan Teks:

```html
<div class="circular-progress" data-circular-progress data-value="65">
  <span class="custom-text">65%</span>
</div>
```

Indeterminate Progress (Spinner Loading):

```html
<div class="circular-progress" data-circular-progress data-indeterminate></div>
```

Varian Warna:

- ```blue``` (default)
- ```green```
- ```yellow```
- ```red```
- ```beige```

#### Customization

Anda bisa menyesuaikan variabel CSS di dalam file JavaScript:

```javascript
:root {
  --blue: #3498db;       // Warna primary
  --border-radius: 4px;  // Border radius
  // ... variabel lainnya
}
```

#### Dialog (Modal)

```html
<button class="btn btn-blue" data-toggle="dialog" data-target="#myDialog">
  Buka Dialog
</button>

<div id="myDialog-backdrop" class="dialog-backdrop"></div>
<div id="myDialog" class="dialog">
  <div class="dialog-box">
    <div class="dialog-content">
      <div class="dialog-header">
        <h5 class="dialog-title">Judul Dialog</h5>
        <button class="dialog-close">&times;</button>
      </div>
      <div class="dialog-body">
        <p>Konten dialog</p>
      </div>
    </div>
  </div>
</div>
```

#### Dropdown

Dropdown digunakan untuk menampilkan daftar opsi saat interaksi (klik/hover).

``` html
<div class="dropdown">
  <!-- Tombol Trigger -->
  <button class="dropdown-toggle">
    Pilih Opsi
  </button>
  
  <!-- Menu Dropdown -->
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Opsi 1</a></li>
    <li><a class="dropdown-item" href="#">Opsi 2</a></li>
    <li><a class="dropdown-item" href="#">Opsi 3</a></li>
  </ul>
</div>
```

#### Grid System

Membuat layout responsif dengan sistem grid 12 kolom.

```html
<div class="container">
  <div class="row">
    <div class="col-md-6">Kolom 1 (6/12)</div>
    <div class="col-md-6">Kolom 2 (6/12)</div>
  </div>
</div>
```

Class yang tersedia:

- ```col-1``` sampai ```col-12``` untuk lebar spesifik
- ```col-md-*```, ```col-lg-*``` untuk breakpoint berbeda
- ```col``` untuk pembagian otomatis

#### Responsive Images

Menampilkan gambar yang menyesuaikan dengan perangkat.

```html
<!-- Gambar dasar -->
<img src="image.jpg" class="img-fluid" alt="Responsive">

<!-- Gambar dengan aspect ratio 16:9 -->
<div class="ratio ratio-16x9">
  <img src="image.jpg" class="img-cover" alt="Cover">
</div>

<!-- Gallery -->
<div class="gallery">
  <img src="image1.jpg" alt="Photo 1">
  <img src="image2.jpg" alt="Photo 2">
</div>
```

Class yang tersedia:

- ```img-fluid```: Gambar responsif dasar
- ```img-cover```, img-contain: Penyesuaian gambar
- ```img-thumbnail```, ```img-rounded```, ```img-circle```: Gaya gambar
- ```ratio-*```: Kontrol aspek rasio (1x1, 4x3, 16x9, 21x9)

#### Snackbar/Toast

```javascript
// Tampilkan snackbar
ElegantSnackbar.show({
  message: "Operasi berhasil!",
  type: "snackbar-green",
  autoDismiss: 3000
});
```

Tipe Snackbar:

- ```snackbar-blue```
- ```snackbar-green```
- ```snackbar-yellow```
- ```snackbar-red```

#### spacing

- ```mt-1``` sampai ```mt-5```: Margin top
- ```mb-1``` sampai ```mb-5```: Margin bottom
- ```p-1``` sampai ```p-5```: Padding

#### Text Alignment

- ```text-left```
- ```text-center```
- ```text-right```

### Icon Element

#### Lokasi Library

```/Views/resources/icon_element.js```

#### Load Library

Sertakan file JavaScript di HTML Anda:

```php
<script><?php include 'resources/icon_element.js' ?></script>
```

#### Cara Penggunaan

Panggil ikon dengan tag ```<icon-element>```:

```html
<icon-element name="settings"></icon-element>
<icon-element name="heart" color="red" size="32"></icon-element>
```

Untuk menambahkan ikon custom Anda sendiri, cukup tambahkan entri baru ke objek icons dengan format:

```javascript
'nama-icon': `<path d="path-data-svg"/>`
```

### Single Page Aplication (SPA)

Template engine, client-side router, dan REST client.

#### Lokasi Library

- Template Engine: ```/Views/resources/template_engine.js```
- Hash Router: ```/Views/resources/hash_router.js```
- REST Client: ```/Views/resources/rest_client.js```

#### Load Library

```php
<script><?php include 'resources/template_engine.js' ?></script>
<script><?php include 'resources/hash_router.js' ?></script>
<script><?php include 'resources/rest_client.js' ?></script>
```

#### Inisialisasi

```javascript
// Buat instance TemplateEngine
const engine = new TemplateEngine({
  // Opsi konfigurasi (opsional)
  delimiters: { start: '{{', end: '}}' },
  bindPrefix: 'bind:'
});

// Buat instance REST Client
const api = new RestClient('https://api.example.com', {
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  errorHandler: (error) => {
    console.error('API Error:', error);
    alert(`Error: ${error.message}`);
  }
});

// Definisikan rute aplikasi
const routes = [
  {
    path: '/',
    template: '<h1>Halaman Utama</h1>'
  },
  // ... rute lainnya
];

// Buat instance router
const router = new HashRouter(engine, routes, document.getElementById('app'));
```

#### Template Engine

Sintaks Dasar:

```html
<!-- Variable -->
<p>{{ user.name }}</p>

<!-- Binding dua arah -->
<input type="text" value="bind:user.name.input">

<!-- Kondisional -->
@if user.isAdmin
  <p>Anda adalah admin</p>
@else
  <p>Anda adalah user biasa</p>
@endif

<!-- Perulangan -->
@foreach products as product
  <div>{{ product.name }}</div>
@endforeach
```

Registrasi Komponen:

```javascript
engine.registerComponent('UserCard', `
  <div class="card">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    {{ slot }}
  </div>
`);
```

Penggunaan Komponen:

```html
<UserCard />
```

#### Hash Router

Membuat Route:

```javascript
const routes = [
  {
    path: '/',
    template: '<h1>Beranda</h1>'
  },
  {
    path: '/about',
    component: 'AboutPage' // Komponen yang sudah diregistrasi
  },
  {
    path: '/users/:id',
    data: async ({id}) => {
      const user = await api.get(`/users/${id}`);
      return { user };
    },
    template: `
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
    `
  },
  {
    path: '404',
    template: '<h1>Halaman tidak ditemukan</h1>'
  }
];
```

Navigasi:

```javascript
// Navigasi dalam JavaScript
router.navigate('/about');

// Navigasi dalam template
<a href="#/about">Tentang Kami</a>
<button onclick="router.navigate('/contact')">Kontak</button>
```

#### REST Client

```javascript

// Buat instance
const api = createClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
});

// GET request
const users = await api.get('/users');

// POST request
const newUser = await api.post('/users', {
  name: 'John',
  email: 'john@example.com'
});

// Dengan error handling
try {
  const response = await api.get('/users');
  console.log(response.data);
} catch (error) {
  console.error('Error:', error.message, error.status);
}
```
