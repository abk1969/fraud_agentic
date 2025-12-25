"""
FraudShield AI - Analytics Router
API endpoints for fraud analytics and reporting
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timedelta
import random

from ..services.fraud_service import FraudService

router = APIRouter()


def get_fraud_service() -> FraudService:
    """Dependency injection for fraud service."""
    from ..main import fraud_service
    if fraud_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    return fraud_service


def generate_trend_data(days: int, base_value: float, variance: float = 0.2):
    """Generate realistic trend data."""
    data = []
    current_date = datetime.now() - timedelta(days=days)
    for i in range(days):
        date = current_date + timedelta(days=i)
        value = base_value * (1 + random.uniform(-variance, variance))
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "value": round(value, 2)
        })
    return data


@router.get("/dashboard")
async def get_dashboard_data(
    period: str = "30d",
    service: FraudService = Depends(get_fraud_service)
):
    """
    Recuperer les donnees du tableau de bord.

    Periodes: 7d, 30d, 90d, 365d
    """
    period_days = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "365d": 365
    }.get(period, 30)

    # Generate realistic mock data based on period
    base_transactions = period_days * 450
    flagged_rate = 0.028  # 2.8% flag rate
    confirmed_rate = 0.72  # 72% of flagged are confirmed fraud

    total_transactions = base_transactions + random.randint(-500, 500)
    flagged_transactions = int(total_transactions * flagged_rate)
    confirmed_fraud = int(flagged_transactions * confirmed_rate)
    false_positives = flagged_transactions - confirmed_fraud
    pending_review = int(flagged_transactions * 0.15)

    total_amount = total_transactions * 850  # Average 850 EUR per transaction
    amount_saved = confirmed_fraud * 2500  # Average 2500 EUR per fraud

    return {
        "period": period,
        "period_days": period_days,
        "summary": {
            "total_transactions": total_transactions,
            "flagged_transactions": flagged_transactions,
            "confirmed_fraud": confirmed_fraud,
            "false_positives": false_positives,
            "pending_review": pending_review,
            "total_amount_processed": round(total_amount, 2),
            "total_amount_saved": round(amount_saved, 2)
        },
        "metrics": {
            "detection_rate": round(confirmed_fraud / max(total_transactions, 1) * 100, 2),
            "precision": round(confirmed_fraud / max(flagged_transactions, 1), 3),
            "recall": 0.94,  # Target recall
            "f1_score": 0.90,
            "false_positive_rate": round(false_positives / max(flagged_transactions, 1) * 100, 2)
        },
        "trends": {
            "fraud_rate_trend": generate_trend_data(period_days, 2.5, 0.3),
            "volume_trend": generate_trend_data(period_days, 450, 0.15),
            "amount_trend": generate_trend_data(period_days, 380000, 0.2)
        },
        "generated_at": datetime.now().isoformat()
    }


@router.get("/statistics")
async def get_fraud_statistics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    group_by: str = "day",
    service: FraudService = Depends(get_fraud_service)
):
    """
    Recuperer les statistiques de fraude.

    Groupement: day, week, month
    """
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

    # Parse dates
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    # Generate statistics based on grouping
    statistics = []
    current = start

    if group_by == "day":
        delta = timedelta(days=1)
    elif group_by == "week":
        delta = timedelta(weeks=1)
    else:  # month
        delta = timedelta(days=30)

    total_transactions = 0
    total_flagged = 0
    total_amount = 0.0
    flagged_amount = 0.0

    while current <= end:
        transactions = random.randint(1100, 1700)
        flagged = int(transactions * random.uniform(0.015, 0.035))
        confirmed = int(flagged * random.uniform(0.65, 0.80))
        amount = transactions * random.uniform(750, 950)
        f_amount = flagged * random.uniform(2000, 3500)

        statistics.append({
            "date": current.strftime("%d/%m"),
            "transactions": transactions,
            "flagged": flagged,
            "confirmed_fraud": confirmed,
            "amount": round(amount, 2),
            "flagged_amount": round(f_amount, 2)
        })

        total_transactions += transactions
        total_flagged += flagged
        total_amount += amount
        flagged_amount += f_amount

        current += delta

    return {
        "period": {
            "start": start_date,
            "end": end_date
        },
        "group_by": group_by,
        "statistics": statistics,
        "totals": {
            "total_transactions": total_transactions,
            "total_flagged": total_flagged,
            "total_amount": round(total_amount, 2),
            "flagged_amount": round(flagged_amount, 2)
        }
    }


@router.get("/fraud-types")
async def get_fraud_type_distribution(
    period: str = "30d",
    service: FraudService = Depends(get_fraud_service)
):
    """
    Recuperer la distribution des types de fraude.
    """
    # Realistic fraud type distribution
    fraud_types = [
        {"type": "surfacturation", "count": 145, "amount": 234500},
        {"type": "prestations_fictives", "count": 98, "amount": 187200},
        {"type": "usurpation_identite", "count": 87, "amount": 156800},
        {"type": "falsification_documents", "count": 76, "amount": 98700},
        {"type": "collusion", "count": 54, "amount": 234100},
        {"type": "fraude_cotisations", "count": 49, "amount": 312400},
    ]

    total = sum(ft["count"] for ft in fraud_types)

    distribution = []
    for ft in fraud_types:
        distribution.append({
            "type": ft["type"],
            "count": ft["count"],
            "percentage": round(ft["count"] / total * 100, 1),
            "amount": ft["amount"]
        })

    return {
        "period": period,
        "distribution": distribution,
        "total": total
    }


@router.get("/providers/risk")
async def get_provider_risk_ranking(
    limit: int = 20,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Recuperer le classement des prestataires par risque.
    """
    providers = [
        {"id": "PRO-001", "name": "Cabinet Medical Alpha", "risk": 0.89, "txn": 245, "flagged": 42, "amount": 156000},
        {"id": "PRO-002", "name": "Clinique Beta", "risk": 0.76, "txn": 189, "flagged": 28, "amount": 234000},
        {"id": "PRO-003", "name": "Laboratoire Gamma", "risk": 0.72, "txn": 312, "flagged": 38, "amount": 89000},
        {"id": "PRO-004", "name": "Centre Dentaire Delta", "risk": 0.68, "txn": 156, "flagged": 18, "amount": 178000},
        {"id": "PRO-005", "name": "Pharmacie Epsilon", "risk": 0.65, "txn": 423, "flagged": 45, "amount": 67000},
        {"id": "PRO-006", "name": "Hopital Zeta", "risk": 0.58, "txn": 567, "flagged": 52, "amount": 456000},
        {"id": "PRO-007", "name": "Cabinet Optique Eta", "risk": 0.54, "txn": 234, "flagged": 19, "amount": 123000},
        {"id": "PRO-008", "name": "Centre Kine Theta", "risk": 0.48, "txn": 178, "flagged": 12, "amount": 89000},
        {"id": "PRO-009", "name": "Clinique Iota", "risk": 0.45, "txn": 298, "flagged": 15, "amount": 187000},
        {"id": "PRO-010", "name": "Laboratoire Kappa", "risk": 0.42, "txn": 456, "flagged": 21, "amount": 134000},
    ]

    ranking = []
    for p in providers[:limit]:
        ranking.append({
            "provider_id": p["id"],
            "provider_name": p["name"],
            "risk_score": p["risk"],
            "total_transactions": p["txn"],
            "flagged_transactions": p["flagged"],
            "total_amount": p["amount"],
            "fraud_rate": round(p["flagged"] / p["txn"] * 100, 1)
        })

    return {
        "ranking": ranking,
        "limit": limit
    }


@router.get("/beneficiaries/risk")
async def get_beneficiary_risk_ranking(
    limit: int = 20,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Recuperer le classement des beneficiaires par risque.
    """
    beneficiaries = [
        {"id": "BEN-001", "name": "Jean Dupont", "risk": 0.92, "txn": 34, "flagged": 12, "amount": 45000},
        {"id": "BEN-002", "name": "Marie Martin", "risk": 0.85, "txn": 28, "flagged": 9, "amount": 38000},
        {"id": "BEN-003", "name": "Pierre Bernard", "risk": 0.78, "txn": 42, "flagged": 11, "amount": 52000},
        {"id": "BEN-004", "name": "Sophie Leroy", "risk": 0.71, "txn": 19, "flagged": 4, "amount": 23000},
        {"id": "BEN-005", "name": "Luc Moreau", "risk": 0.68, "txn": 56, "flagged": 10, "amount": 67000},
        {"id": "BEN-006", "name": "Claire Simon", "risk": 0.62, "txn": 31, "flagged": 5, "amount": 34000},
        {"id": "BEN-007", "name": "Antoine Laurent", "risk": 0.55, "txn": 45, "flagged": 6, "amount": 48000},
        {"id": "BEN-008", "name": "Emma Petit", "risk": 0.49, "txn": 23, "flagged": 2, "amount": 19000},
        {"id": "BEN-009", "name": "Thomas Roux", "risk": 0.45, "txn": 67, "flagged": 4, "amount": 72000},
        {"id": "BEN-010", "name": "Julie Fournier", "risk": 0.41, "txn": 38, "flagged": 2, "amount": 41000},
    ]

    ranking = []
    for b in beneficiaries[:limit]:
        ranking.append({
            "beneficiary_id": b["id"],
            "beneficiary_name": b["name"],
            "risk_score": b["risk"],
            "total_transactions": b["txn"],
            "flagged_transactions": b["flagged"],
            "total_amount": b["amount"],
            "fraud_rate": round(b["flagged"] / b["txn"] * 100, 1)
        })

    return {
        "ranking": ranking,
        "limit": limit
    }


@router.get("/model/performance")
async def get_model_performance(
    period: str = "30d",
    service: FraudService = Depends(get_fraud_service)
):
    """
    Recuperer les metriques de performance du modele.
    """
    model_info = service.get_model_info()

    # Realistic performance metrics
    tp = random.randint(420, 490)
    tn = random.randint(8000, 8500)
    fp = random.randint(55, 80)
    fn = random.randint(18, 30)

    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    f1 = 2 * (precision * recall) / (precision + recall)

    # Cost-sensitive rewards
    total_reward = (tp * 10) + (tn * 1) + (fp * -5) + (fn * -50)
    total_samples = tp + tn + fp + fn
    avg_reward = total_reward / total_samples

    return {
        "period": period,
        "model": {
            "type": model_info.get("model_type", "A2C"),
            "version": "1.2.0"
        },
        "performance": {
            "precision": round(precision, 3),
            "recall": round(recall, 3),
            "f1_score": round(f1, 3),
            "auc_roc": round(random.uniform(0.90, 0.94), 3)
        },
        "cost_analysis": {
            "true_positives": tp,
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "total_reward": total_reward,
            "average_reward": round(avg_reward, 2)
        },
        "confusion_matrix": {
            "tp": tp,
            "tn": tn,
            "fp": fp,
            "fn": fn
        }
    }


@router.get("/model/training")
async def get_training_status(
    service: FraudService = Depends(get_fraud_service)
):
    """
    Recuperer le statut d'entrainement du modele RL.
    """
    return {
        "status": "idle",
        "last_trained": (datetime.now() - timedelta(days=2)).isoformat(),
        "next_scheduled": (datetime.now() + timedelta(days=5)).isoformat(),
        "experience_buffer_size": random.randint(14000, 16000),
        "current_epoch": None,
        "total_epochs": None,
        "loss": None
    }


@router.post("/export")
async def export_report(
    report_type: str,
    start_date: str,
    end_date: str,
    format: str = "pdf",
    service: FraudService = Depends(get_fraud_service)
):
    """
    Exporter un rapport d'analyse.

    Types: summary, detailed, compliance
    Formats: pdf, csv, xlsx
    """
    # In production, this would generate the actual report
    report_id = f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    return {
        "report_id": report_id,
        "report_type": report_type,
        "period": {
            "start": start_date,
            "end": end_date
        },
        "format": format,
        "status": "generating",
        "download_url": None,
        "estimated_completion": (datetime.now() + timedelta(seconds=30)).isoformat(),
        "message": f"Rapport {report_type} en cours de generation. ID: {report_id}"
    }
