# B40 API Documentation

## Kandungan

- [Pengenalan](#pengenalan)
- [Axios lib](#axios-library)
- [Students routes](#students-routes)

## Pengenalan

Ada banyak jenis request yg ada. Dlm projek ni kita guna 3 jenis:

- `get` request utk dapatkan data
- `post` request utk send data
- `put` request utk update data

### Axios library

Kita akan gunakan axios utk perform request ke server. Cara nak guna agak senang berbanding dgn `fetch` function yg dh sedia ada.

Aku baru je install axios dlm projek kita, so kau install dulu dlm laptop kau:

```terminal
npm install
```

Cara pakai senang je. Kau kene import beberapa file yg aku dh buat

```javascript
import instance from "./api/instance";

instance
  .post(
    "/admin/login", // route yg kita target
    {
      // body, data yg perlu ada (jika perlu)
      email: "email@email.com",
      password: "password",
    },
    {
      // header
    }
  )
  .then(res => {
    // data yg kita dpt drpd request
    console.log(res.data);
  })
  .catch(err => {
    // handle error
    console.log(err);
  });
```

## ⚠️Include access token for every route except login

Token akan disimpan dlm `localStorage`

Aku dah buat `hook` which is `useLocalStorage` utk dptkan/simpan access token. Documentation ada kat repo web.

Contoh:

```javascript
instance
  .get("/api/students", {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

## Students Routes

### 1. Get `/api/students`

Contoh: Kat atas tadi

Dapatkan semua data students.

### 2. Get `/api/students/:id`

Dapatkan specific students

Contoh:

```javascript
const id = 1;

instance
  .get(`/api/students/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

### 3. Post `api/students`

Add new record/new students gitu.

Contoh:

```javascript
instance
  .post("/api/students", {
    name: 'ali',
    matric_no: '0000'
    ic_no: '0000'
  } {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

### 4. Put `api/students/:id/wallet`

Update wallet ammount

Contoh:

```javascript
const id = 1;

instance
  .put(`/api/students/${id}/wallet`, {
    amount: 150
  } {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

### 5. Put `api/students/:id/suspend`

Suspend status student

Contoh:

```javascript
const id = 1;

instance
  .put(`/api/students/${id}/suspend`, {
    active: false
  } {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```
