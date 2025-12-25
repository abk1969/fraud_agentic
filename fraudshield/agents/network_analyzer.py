"""
FraudShield AI - Network Analyzer Agent
Specialized agent for fraud network and relationship analysis

Uses graph analytics to:
- Detect fraud rings
- Analyze entity relationships
- Compute centrality/influence scores
- Identify suspicious communities
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from .base_agent import (
    AgentConfig,
    AgentContext,
    create_agent_instruction,
    GENERATION_CONFIG,
)
from ..tools.network_tools import (
    analyze_network,
    find_communities,
    detect_fraud_rings,
    compute_centrality,
    find_shortest_path,
    get_entity_neighbors,
)


class NetworkAnalyzerAgent:
    """
    Network Analyzer Agent for FraudShield.

    Responsibilities:
    - Analyze relationship networks around entities
    - Detect fraud rings and collusion patterns
    - Identify community memberships
    - Compute influence/centrality scores
    - Find connections between suspicious entities
    """

    def __init__(self):
        """Initialize Network Analyzer Agent."""
        self.config = AgentConfig(
            name="network_analyzer",
            model="gemini-flash-latest",
            description="Agent spécialisé dans l'analyse de réseaux de fraude",
            instruction=self._build_instruction(),
            output_key="network_analysis",
            generate_content_config=GENERATION_CONFIG,
        )

        # Tools available to this agent
        self.tools = [
            analyze_network,
            find_communities,
            detect_fraud_rings,
            compute_centrality,
            find_shortest_path,
            get_entity_neighbors,
        ]

    def _build_instruction(self) -> str:
        """Build agent instruction."""
        return create_agent_instruction(
            role="un expert en analyse de réseaux de fraude",
            responsibilities=[
                "Analyser les réseaux de relations entre entités",
                "Détecter les cercles de fraude (fraud rings)",
                "Identifier les communautés suspectes",
                "Calculer les scores d'influence et centralité",
                "Tracer les connexions entre entités signalées",
            ],
            guidelines=[
                "Utiliser les algorithmes de détection de communauté (Louvain)",
                "Évaluer les métriques de centralité (degree, betweenness, PageRank)",
                "Identifier les entités pivot (hubs) dans les réseaux",
                "Analyser les patterns de relations partagées",
                "Considérer les connexions directes et indirectes",
            ],
            output_format="""
Retourne un JSON structuré avec:
- network_stats: Statistiques du réseau (noeuds, arêtes, densité)
- communities: Communautés identifiées
- fraud_rings: Cercles de fraude détectés
- centrality_scores: Scores de centralité
- key_entities: Entités clés/pivots
- risk_connections: Connexions à risque
- network_risk_score: Score de risque réseau
- recommendation: Recommandation basée sur l'analyse
"""
        )

    async def analyze(
        self,
        entity_id: str,
        context: AgentContext,
        entity_type: str = "beneficiary",
        depth: int = 2
    ) -> Dict[str, Any]:
        """
        Analyze network around an entity.

        Args:
            entity_id: Entity to analyze
            context: Agent execution context
            entity_type: Type of entity
            depth: Relationship depth to explore

        Returns:
            Network analysis results
        """
        # Step 1: Analyze immediate network
        network_result = analyze_network(entity_id, entity_type, depth)
        network_stats = network_result.get("network_stats", {})
        network_risks = network_result.get("network_risks", [])

        # Step 2: Find community membership
        community_result = find_communities(entity_id)
        community = community_result.get("community", {})
        community_risk = community_result.get("community_risk", "low")

        # Step 3: Detect potential fraud rings
        rings_result = detect_fraud_rings(seed_entity_id=entity_id)
        detected_rings = rings_result.get("rings", [])

        # Step 4: Compute centrality
        centrality_result = compute_centrality(entity_id)
        centrality_scores = centrality_result.get("centrality_scores", {})
        is_influential = centrality_result.get("is_influential_node", False)

        # Step 5: Get direct neighbors
        neighbors_result = get_entity_neighbors(entity_id)
        neighbors = neighbors_result.get("neighbors", [])

        # Identify key entities
        key_entities = []
        if is_influential:
            key_entities.append({
                "entity_id": entity_id,
                "role": "hub",
                "reason": "High centrality scores"
            })

        for member in community.get("community_members", []):
            if member.get("role") in ["hub", "connector"]:
                key_entities.append({
                    "entity_id": member.get("id"),
                    "role": member.get("role"),
                    "reason": "Community role"
                })

        # Identify risk connections
        risk_connections = []
        for neighbor in neighbors:
            if neighbor.get("entity_type") == "provider":
                props = neighbor.get("relationship_properties", {})
                if props.get("claim_count", 0) > 10:
                    risk_connections.append({
                        "entity_id": neighbor.get("entity_id"),
                        "type": "high_volume_provider",
                        "claim_count": props.get("claim_count")
                    })

        # Calculate network risk score
        network_risk_score = self._calculate_network_risk(
            network_stats,
            community_risk,
            detected_rings,
            is_influential,
            network_risks
        )

        # Determine recommendation
        if network_risk_score >= 0.6 or len(detected_rings) > 0:
            recommendation = "investigate"
        elif network_risk_score >= 0.3 or community_risk in ["medium", "high"]:
            recommendation = "monitor"
        else:
            recommendation = "normal"

        return {
            "status": "success",
            "entity_id": entity_id,
            "entity_type": entity_type,
            "analysis_depth": depth,
            "network_stats": network_stats,
            "community": {
                "id": community.get("community_id"),
                "size": community.get("community_size", 0),
                "density": community.get("community_density", 0),
                "fraud_rate": community.get("fraud_rate_in_community", 0),
                "risk_level": community_risk
            },
            "fraud_rings": {
                "detected_count": len(detected_rings),
                "rings": detected_rings,
                "total_entities_involved": sum(r.get("ring_size", 0) for r in detected_rings),
                "total_amount_at_risk": sum(r.get("total_amount_involved", 0) for r in detected_rings)
            },
            "centrality_scores": centrality_scores,
            "is_influential_node": is_influential,
            "key_entities": key_entities,
            "risk_connections": risk_connections,
            "direct_neighbors_count": len(neighbors),
            "network_risk_score": round(network_risk_score, 4),
            "recommendation": recommendation,
            "analysis_timestamp": datetime.now().isoformat(),
            "elapsed_ms": context.elapsed_time_ms()
        }

    def _calculate_network_risk(
        self,
        network_stats: Dict,
        community_risk: str,
        rings: List[Dict],
        is_influential: bool,
        network_risks: List[Dict]
    ) -> float:
        """Calculate overall network risk score."""
        score = 0.0

        # Community risk contribution
        community_risk_map = {"low": 0.1, "medium": 0.3, "high": 0.5}
        score += community_risk_map.get(community_risk, 0.1)

        # Fraud rings contribution
        if rings:
            highest_confidence = max(r.get("detection_confidence", 0) for r in rings)
            score += highest_confidence * 0.3

        # Influential node contribution
        if is_influential:
            score += 0.1

        # Network risks contribution
        for risk in network_risks:
            severity = risk.get("severity", "low")
            if severity == "high":
                score += 0.15
            elif severity == "medium":
                score += 0.1
            else:
                score += 0.05

        # Clustering coefficient contribution
        clustering = network_stats.get("clustering_coefficient", 0)
        if clustering > 0.6:
            score += 0.1

        return min(score, 1.0)

    async def find_connection(
        self,
        entity_id_1: str,
        entity_id_2: str,
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        Find connection between two entities.

        Args:
            entity_id_1: First entity
            entity_id_2: Second entity
            context: Agent execution context

        Returns:
            Connection analysis
        """
        path_result = find_shortest_path(entity_id_1, entity_id_2)

        # Analyze each entity in the path
        path_entities = []
        if path_result.get("path_found"):
            for node in path_result.get("path", []):
                centrality = compute_centrality(node.get("entity_id", ""))
                path_entities.append({
                    **node,
                    "is_influential": centrality.get("is_influential_node", False)
                })

        return {
            "status": "success",
            "source": entity_id_1,
            "target": entity_id_2,
            "connected": path_result.get("path_found", False),
            "path_length": path_result.get("path_length"),
            "path": path_entities,
            "relationship_types": path_result.get("relationship_types_in_path", []),
            "analysis_timestamp": datetime.now().isoformat(),
            "elapsed_ms": context.elapsed_time_ms()
        }

    async def scan_for_rings(
        self,
        context: AgentContext,
        min_size: int = 3
    ) -> Dict[str, Any]:
        """
        Scan network for fraud rings.

        Args:
            context: Agent execution context
            min_size: Minimum ring size

        Returns:
            Fraud ring scan results
        """
        rings_result = detect_fraud_rings(min_ring_size=min_size)

        # Prioritize rings by confidence and amount
        rings = rings_result.get("rings", [])
        prioritized_rings = sorted(
            rings,
            key=lambda r: (r.get("detection_confidence", 0), r.get("total_amount_involved", 0)),
            reverse=True
        )

        return {
            "status": "success",
            "scan_type": "full_network",
            "min_ring_size": min_size,
            "rings_detected": len(prioritized_rings),
            "prioritized_rings": prioritized_rings,
            "total_entities_at_risk": sum(r.get("ring_size", 0) for r in prioritized_rings),
            "total_amount_at_risk": sum(r.get("total_amount_involved", 0) for r in prioritized_rings),
            "scan_timestamp": datetime.now().isoformat(),
            "elapsed_ms": context.elapsed_time_ms()
        }

    def get_adk_config(self) -> Dict[str, Any]:
        """Get ADK Agent configuration."""
        return {
            **self.config.to_dict(),
            "tools": self.tools,
        }


def create_agent() -> NetworkAnalyzerAgent:
    """Factory function to create agent instance."""
    return NetworkAnalyzerAgent()
