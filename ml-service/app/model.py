import torch
import timm
from PIL import Image
import io
import time
import os
from typing import Dict, Tuple

class ViTModel:
    def __init__(self):
        # Berdasarkan arsitektur vit-base-patch16-224 yang umum di timm
        self.model_name = "vit_base_patch16_224" 
        self.labels = ['Coccidiosis', 'Healthy', 'Newcastle', 'Salmonella']
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.data_config = None
        self.transform = None

    def load_model(self):
        print(f"Loading timm model {self.model_name} on {self.device}...")
        
        # 1. Inisialisasi arsitektur model
        self.model = timm.create_model(
            self.model_name, 
            pretrained=False, 
            num_classes=len(self.labels)
        )

        # 2. Muat weights kustom
        weights_path = os.path.join(os.path.dirname(__file__), "weights", "model.pth")
        if os.path.exists(weights_path):
            print(f"Memuat weights kustom dari {weights_path}...")
            try:
                state_dict = torch.load(weights_path, map_location=self.device)
                
                # Menangani jika state_dict bersarang
                if isinstance(state_dict, dict) and 'state_dict' in state_dict:
                    state_dict = state_dict['state_dict']
                elif isinstance(state_dict, dict) and 'model' in state_dict:
                    state_dict = state_dict['model']
                
                self.model.load_state_dict(state_dict, strict=True)
                print("Weights kustom berhasil dimuat (Strict Match).")
            except Exception as e:
                print(f"Gagal memuat secara strict: {e}")
                print("Mencoba memuat dengan strict=False...")
                self.model.load_state_dict(state_dict, strict=False)
                print("Weights dimuat dengan strict=False.")
        else:
            print(f"Peringatan: File {weights_path} tidak ditemukan!")

        # 3. Setup Preprocessing (Transform)
        self.data_config = timm.data.resolve_model_data_config(self.model)
        self.transform = timm.data.create_transform(**self.data_config, is_training=False)

        self.model.to(self.device)
        self.model.eval()
        print("Inisialisasi model selesai.")

    def predict(self, image_bytes: bytes) -> Tuple[str, float, Dict[str, float], float]:
        start_time = time.time()
        
        # Preprocessing
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Inference
        with torch.no_grad():
            output = self.model(input_tensor)
            probs = torch.nn.functional.softmax(output, dim=-1)
            
        # Extract results
        confidences = probs[0].tolist()
        max_confidence = max(confidences)
        predicted_class_idx = confidences.index(max_confidence)
        label = self.labels[predicted_class_idx]
        
        all_probs = {self.labels[i]: confidences[i] for i in range(len(self.labels))}
        
        print(f"DEBUG - Prediksi: {label} ({max_confidence*100:.2f}%)")
        print(f"DEBUG - Detail: {all_probs}")
        
        process_time_ms = (time.time() - start_time) * 1000
        
        return label, max_confidence, all_probs, process_time_ms

# Singleton instance
vit_model = ViTModel()
