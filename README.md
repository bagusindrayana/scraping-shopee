### Run
- `node app.js`
- buka url `http://localhost:3000/?keyword=laptop`

### Response
- Success
```json
[
    {
        "nama":"-",
        "harga":"Rp",
        "link":"Rp"
    }
]
```

- Error
```json
{
    "error":"-",
}
```


### Params

semua parameter filter di shopee bisa di terapkan

- `keyword` cari
- `minPrice` harga minimum
- `maxPrice` harga maksimum
- `filters` jenis toko
- `locations` lokasi
- `page` halaman