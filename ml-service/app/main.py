from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.model import vit_model
from app.schemas import PredictionResponse, HealthResponse
import uvicorn
import os

app = FastAPI(title="Chicken Feces Classification ML Service")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], # Added frontend dev port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    vit_model.load_model()

@app.get("/health", response_model=HealthResponse)
async def health():
    return {
        "status": "healthy",
        "model_loaded": vit_model.model is not None
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    try:
        image_bytes = await file.read()
        label, confidence, all_probs, process_time = vit_model.predict(image_bytes)
        
        return {
            "label": label,
            "confidence": confidence,
            "all_probs": all_probs,
            "process_time_ms": process_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
