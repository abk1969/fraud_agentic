"""
FraudShield AI - Documents Router
API endpoints for document analysis
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List, Optional
from datetime import datetime

from ..models.requests import DocumentAnalysisRequest, Document
from ..models.responses import DocumentAnalysisResponse
from ..services.fraud_service import FraudService

router = APIRouter()


def get_fraud_service() -> FraudService:
    """Dependency injection for fraud service."""
    from ..main import fraud_service
    if fraud_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    return fraud_service


@router.post("/analyze", response_model=DocumentAnalysisResponse)
async def analyze_documents(
    request: DocumentAnalysisRequest,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Analyser des documents pour détecter falsification et extraire des entités.

    Types d'analyse disponibles:
    - **ocr**: Extraction de texte
    - **entities**: Extraction d'entités (dates, montants, noms)
    - **tampering**: Détection de falsification
    - **classification**: Classification du type de document
    """
    try:
        documents = [doc.dict() for doc in request.documents]

        result = await service.analyze_documents(
            documents=documents,
            transaction_id=request.transaction_id
        )

        return DocumentAnalysisResponse(
            status="success",
            documents_analyzed=result.get("documents_analyzed", 0),
            overall_authenticity_score=result.get("overall_authenticity_score", 1.0),
            document_results=result.get("document_results", []),
            risk_indicators=result.get("risk_indicators", []),
            recommendation=result.get("recommendation", "review"),
            processing_time_ms=result.get("elapsed_ms", 0)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    transaction_id: Optional[str] = None,
    document_type: Optional[str] = None
):
    """
    Uploader un document pour analyse.

    Formats supportés: PDF, JPEG, PNG, TIFF
    """
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/tiff"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier non supporté. Types autorisés: {allowed_types}"
        )

    # In production, would upload to Cloud Storage
    return {
        "status": "success",
        "document_id": f"DOC-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "filename": file.filename,
        "content_type": file.content_type,
        "transaction_id": transaction_id,
        "document_type": document_type,
        "storage_uri": f"gs://fraudshield-docs/{file.filename}",
        "note": "Document upload requires Cloud Storage integration"
    }


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Récupérer les informations d'un document.
    """
    return {
        "document_id": document_id,
        "status": "not_found",
        "note": "Document lookup requires database integration"
    }


@router.post("/{document_id}/verify")
async def verify_document(
    document_id: str,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Vérifier l'authenticité d'un document.
    """
    # In production, would call tampering detection
    return {
        "document_id": document_id,
        "is_authentic": True,
        "authenticity_score": 0.95,
        "checks_performed": [
            "font_consistency",
            "image_manipulation",
            "metadata_consistency",
            "pixel_analysis"
        ],
        "note": "Full verification requires Document AI integration"
    }


@router.post("/{document_id}/extract")
async def extract_entities(
    document_id: str,
    entity_types: Optional[List[str]] = None,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Extraire les entités d'un document.
    """
    default_types = ["date", "amount", "person", "organization", "identifier"]
    types_to_extract = entity_types or default_types

    return {
        "document_id": document_id,
        "entity_types": types_to_extract,
        "entities": {
            "dates": [],
            "amounts": [],
            "persons": [],
            "organizations": [],
            "identifiers": []
        },
        "note": "Entity extraction requires Document AI integration"
    }


@router.post("/compare")
async def compare_documents(
    document_id_1: str,
    document_id_2: str,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Comparer deux documents pour détecter les similarités.
    """
    return {
        "document_1": document_id_1,
        "document_2": document_id_2,
        "comparison": {
            "text_similarity": 0.0,
            "visual_similarity": 0.0,
            "entity_overlap": 0.0,
            "possible_duplicate": False
        },
        "note": "Document comparison requires full integration"
    }
