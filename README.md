### Run
- `node cmd.js keyword=laptop` add more params with value separate with whitespace `keyword=laptop minPrice=5000000`
- `node app.js`
- web buka url `http://localhost:3000/?keyword=laptop`

### Response
- Success
```json
[
    {
        "nama":"-",
        "harga":"Rp",
        "link":"https"
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