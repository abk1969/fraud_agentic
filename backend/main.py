"""
FraudShield AI - FastAPI Backend
Main application entry point

Features:
- REST API for fraud detection
- WebSocket for real-time updates
- OpenAPI documentation
- CORS support
- Health checks
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import uuid

from .routers import transactions, documents, investigations, analytics, agents, alerts, settings
from .models.requests import (
    TransactionRequest,
    BatchTransactionRequest,
    DocumentAnalysisRequest,
    InvestigationRequest,
)
from .models.responses import (
    FraudDecisionResponse,
    BatchResultResponse,
    HealthResponse,
)
from .services.fraud_service import FraudService
from .services.websocket_manager import WebSocketManager

# WebSocket manager for real-time updates
ws_manager = WebSocketManager()

# Fraud detection service
fraud_service: Optional[FraudService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global fraud_service

    # Startup
    print("[START] Starting FraudShield AI Backend...")
    fraud_service = FraudService()
    await fraud_service.initialize()
    print("[READY] FraudShield AI Backend ready")

    yield

    # Shutdown
    print("[STOP] Shutting down FraudShield AI Backend...")
    if fraud_service:
        await fraud_service.shutdown()


# Create FastAPI application
app = FastAPI(
    title="FraudShield AI API",
    description="""
    API de détection de fraude pour les groupes de protection sociale français.

    ## Fonctionnalités

    - **Analyse de transactions** - Scoring de fraude en temps réel
    - **Analyse documentaire** - OCR et détection de falsification
    - **Vérification d'identité** - RNIPP, sanctions, RIB
    - **Analyse de réseau** - Détection de cercles de fraude
    - **Rapports d'investigation** - XAI et audit

    ## Architecture

    Basé sur Google ADK avec agents IA spécialisés et approche LLM+RL cost-sensitive.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["Transactions"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(investigations.router, prefix="/api/v1/investigations", tags=["Investigations"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["Agents"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(settings.router, tags=["Settings"])


# Health check endpoints
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Vérification de l'état de santé de l'API."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now().isoformat(),
        services={
            "fraud_service": fraud_service is not None,
            "websocket": True,
        }
    )


@app.get("/ready", tags=["Health"])
async def readiness_check():
    """Vérification de la disponibilité du service."""
    if fraud_service is None:
        raise HTTPException(status_code=503, detail="Service not ready")
    return {"status": "ready"}


# WebSocket endpoint for real-time updates
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket pour les mises à jour en temps réel."""
    await ws_manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            await ws_manager.send_personal_message(
                {"type": "ack", "message": "received"},
                client_id
            )
    except WebSocketDisconnect:
        ws_manager.disconnect(client_id)


# Quick fraud check endpoint (for simple integrations)
@app.post("/api/v1/quick-check", tags=["Quick"])
async def quick_fraud_check(request: TransactionRequest):
    """
    Vérification rapide de fraude.

    Utilise le workflow QUICK pour un pré-screening rapide.
    """
    if fraud_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")

    result = await fraud_service.process_transaction(
        transaction=request.transaction.dict(),
        workflow="quick"
    )

    return {
        "transaction_id": request.transaction.transaction_id,
        "decision": result.get("result", {}).get("decision"),
        "fraud_probability": result.get("result", {}).get("fraud_probability"),
        "risk_level": result.get("result", {}).get("risk_level"),
        "requires_full_analysis": result.get("result", {}).get("requires_full_analysis", False),
    }


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat(),
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat(),
        }
    )


def get_fraud_service() -> FraudService:
    """Dependency to get fraud service."""
    if fraud_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    return fraud_service
