"""
FraudShield AI - Tools Module
All tools available to agents for fraud detection

Tool Categories:
- fraud_tools: Transaction scoring, pattern matching, anomaly detection
- document_tools: OCR, tampering detection, entity extraction
- identity_tools: RNIPP verification, RIB validation, sanctions check
- network_tools: Graph analysis, fraud rings, community detection
- explanation_tools: XAI, report generation, audit formatting
"""

from .fraud_tools import (
    serialize_transaction,
    compute_embedding,
    detect_anomalies,
    match_fraud_patterns,
    score_transaction,
    get_transaction_history,
    classify_risk_level,
)

from .document_tools import (
    analyze_document,
    extract_entities,
    detect_tampering,
    classify_document,
    ocr_extract,
    validate_medical_document,
)

from .identity_tools import (
    verify_identity,
    check_rnipp,
    validate_rib,
    cross_reference_data,
    check_sanctions_list,
)

from .network_tools import (
    analyze_network,
    find_communities,
    detect_fraud_rings,
    compute_centrality,
    find_shortest_path,
    get_entity_neighbors,
)

from .explanation_tools import (
    generate_explanation,
    create_investigation_report,
    summarize_case,
    get_attention_weights,
    format_for_audit,
)

__all__ = [
    # Fraud tools
    "serialize_transaction",
    "compute_embedding",
    "detect_anomalies",
    "match_fraud_patterns",
    "score_transaction",
    "get_transaction_history",
    "classify_risk_level",
    # Document tools
    "analyze_document",
    "extract_entities",
    "detect_tampering",
    "classify_document",
    "ocr_extract",
    "validate_medical_document",
    # Identity tools
    "verify_identity",
    "check_rnipp",
    "validate_rib",
    "cross_reference_data",
    "check_sanctions_list",
    # Network tools
    "analyze_network",
    "find_communities",
    "detect_fraud_rings",
    "compute_centrality",
    "find_shortest_path",
    "get_entity_neighbors",
    # Explanation tools
    "generate_explanation",
    "create_investigation_report",
    "summarize_case",
    "get_attention_weights",
    "format_for_audit",
]
