# ML Service - Chicken Feces Classification

Layanan inferensi menggunakan Vision Transformer (ViT) untuk klasifikasi feses ayam.

## Prasyarat
- Python 3.9+
- Pip atau Poetry

## Cara Menjalankan

1. **Buat Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. **Install Dependensi**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Jalankan Service**:
   ```bash
   # Dari direktori ml-service/
   python -m app.main
   ```
   Service akan berjalan di `http://localhost:8000`.

## Endpoints

- `GET /health`: Mengecek status layanan dan apakah model sudah dimuat.
- `POST /predict`: Mengirim file gambar untuk mendapatkan prediksi.
  - Body: `file` (UploadFile)
  - Response: Label, Confidence, All Probabilities, Process Time.

## Catatan Model
Layanan ini menggunakan arsitektur `google/vit-base-patch16-224`. 

### Cara Menggunakan Model Anda:
1. Simpan file hasil training Anda (`.pth`) ke dalam direktori `app/weights/`.
2. Ubah nama filenya menjadi `model.pth`.
3. Restart layanan. Sistem akan otomatis mendeteksi dan memuat weight kustom tersebut.
4. Pastikan urutan label di `app/model.py` (baris 12) sesuai dengan urutan label saat training:
   `["Healthy", "Coccidiosis", "Newcastle", "Salmonella"]`


   .\venv\Scripts\activate

