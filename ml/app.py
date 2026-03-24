from fastapi import FastAPI
from routes.ai import router as ai_router
from routes.ml_score import router as ml_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Anomaly Center API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(ml_router)
app.include_router(ai_router, prefix="/ai")
@app.get("/health")
def health():
    return {"status": "ok"}