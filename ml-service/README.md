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
Layanan ini menggunakan model pretrained `google/vit-base-patch16-224` sebagai placeholder. Untuk akurasi skripsi, pastikan Anda mengganti model loader di `app/model.py` dengan model yang sudah Anda fine-tune.
