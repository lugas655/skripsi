import torch
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import io
import time
from typing import Dict, Tuple

class ViTModel:
    def __init__(self):
        self.model_name = "google/vit-base-patch16-224"
        self.labels = ["Healthy", "Coccidiosis", "Newcastle", "Salmonella"]
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.processor = None

    def load_model(self):
        print(f"Loading model {self.model_name} on {self.device}...")
        # In a real scenario, you would load your fine-tuned weights here
        # For now, we load the base model and adjust the classifier head
        self.processor = ViTImageProcessor.from_pretrained(self.model_name)
        self.model = ViTForImageClassification.from_pretrained(
            self.model_name,
            num_labels=len(self.labels),
            id2label={i: label for i, label in enumerate(self.labels)},
            label2id={label: i for i, label in enumerate(self.labels)},
            ignore_mismatched_sizes=True
        )
        self.model.to(self.device)
        self.model.eval()
        print("Model loaded successfully.")

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
