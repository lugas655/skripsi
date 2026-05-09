import torch
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import io
import time
import os
from typing import Dict, Tuple

class ViTModel:
    def __init__(self):
        self.model_name = "google/vit-base-patch16-224"
        self.labels = ['Coccidiosis', 'Healthy', 'Newcastle', 'Salmonella']
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.processor = None

    def load_model(self):
        print(f"Loading model {self.model_name} on {self.device}...")
        
        # Load processor and base model
        print("Mendownload/Memuat processor...")
        self.processor = ViTImageProcessor.from_pretrained(self.model_name)
        
        print(f"Mendownload/Memuat arsitektur model {self.model_name}...")
        self.model = ViTForImageClassification.from_pretrained(
            self.model_name,
            num_labels=len(self.labels),
            id2label={i: label for i, label in enumerate(self.labels)},
            label2id={label: i for i, label in enumerate(self.labels)},
            ignore_mismatched_sizes=True
        )
        print("Arsitektur model berhasil dimuat.")

        # Load custom weights if available
        weights_path = os.path.join(os.path.dirname(__file__), "weights", "model.pth")
        if os.path.exists(weights_path):
            print(f"Loading custom weights from {weights_path}...")
            try:
                state_dict = torch.load(weights_path, map_location=self.device)
                # Handle cases where state_dict might be nested under 'model' or 'state_dict' keys
                if isinstance(state_dict, dict) and 'state_dict' in state_dict:
                    state_dict = state_dict['state_dict']
                elif isinstance(state_dict, dict) and 'model' in state_dict:
                    state_dict = state_dict['model']
                
                self.model.load_state_dict(state_dict, strict=False)
                print("Custom weights loaded successfully.")
            except Exception as e:
                print(f"Error loading custom weights: {e}")
                print("Continuing with base model weights...")
        else:
            print(f"No custom weights found at {weights_path}. Using base model.")

        self.model.to(self.device)
        self.model.eval()
        print("Model initialization complete.")

    def predict(self, image_bytes: bytes) -> Tuple[str, float, Dict[str, float], float]:
        start_time = time.time()
        
        # Load and preprocess image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        
        # Inference
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)
            
        # Extract results
        confidences = probs[0].tolist()
        max_confidence = max(confidences)
        predicted_class_idx = confidences.index(max_confidence)
        label = self.labels[predicted_class_idx]
        
        all_probs = {self.labels[i]: confidences[i] for i in range(len(self.labels))}
        
        process_time_ms = (time.time() - start_time) * 1000
        
        return label, max_confidence, all_probs, process_time_ms

# Singleton instance
vit_model = ViTModel()
