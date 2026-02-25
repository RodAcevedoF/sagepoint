import { IConceptRepository, Concept } from '@sagepoint/domain';
import { Neo4jService } from '@sagepoint/graph';
import { Injectable, Logger } from '@nestjs/common';
import type { Record as Neo4jRecord, Node } from 'neo4j-driver';

interface ConceptNode {
  id: string;
  name: string;
  documentId: string;
  description?: string;
}

interface Neo4jConceptProperties {
  id: string;
  name: string;
  documentId: string;
  description?: string;
}

@Injectable()
export class Neo4jConceptRepository implements IConceptRepository {
  private readonly logger = new Logger(Neo4jConceptRepository.name);

  constructor(private readonly neo4j: Neo4jService) {}

  async save(concept: Concept): Promise<void> {
    const cypher = `
      MERGE (c:Concept {id: $id})
      SET c.name = $name, c.description = $description, c.documentId = $documentId
    `;
    await this.neo4j.write(cypher, {
      id: concept.id,
      name: concept.name,
      description: concept.description || '',
      documentId: concept.documentId,
    });
  }

  async findById(id: string): Promise<Concept | null> {
    const cypher = `
      MATCH (c:Concept {id: $id})
      RETURN c
    `;
    const result = await this.neo4j.read(cypher, { id });
    if (result.records.length === 0) return null;

    const node = this.extractConceptNode(result.records[0]);
    return new Concept(node.id, node.name, node.documentId, node.description);
  }

  async searchByName(name: string): Promise<Concept[]> {
    const cypher = `
      MATCH (c:Concept)
      WHERE toLower(c.name) CONTAINS toLower($name)
      RETURN c
      LIMIT 10
    `;
    const result = await this.neo4j.read(cypher, { name });

    return result.records.map((record) => {
      const node = this.extractConceptNode(record);
      return new Concept(node.id, node.name, node.documentId, node.description);
    });
  }

  async addRelation(
    fromId: string,
    toId: string,
    type: 'DEPENDS_ON' | 'NEXT_STEP',
  ): Promise<void> {
    const cypher = `
      MATCH (a:Concept {id: $fromId})
      MATCH (b:Concept {id: $toId})
      MERGE (a)-[r:${type}]->(b)
    `;
    await this.neo4j.write(cypher, { fromId, toId });
  }

  async getGraphByDocumentId(documentId: string): Promise<{
    nodes: Concept[];
    edges: { from: string; to: string; type: string }[];
  }> {
    this.logger.debug(`Fetching graph for documentId: ${documentId}`);

    const nodesResult = await this.neo4j.read(
      `MATCH (c:Concept {documentId: $documentId}) RETURN c`,
      { documentId },
    );

    this.logger.debug(`Found ${nodesResult.records.length} nodes`);

    const nodes = nodesResult.records.map((r) => {
      const node = this.extractConceptNode(r);
      return new Concept(node.id, node.name, node.documentId, node.description);
    });

    const edgesResult = await this.neo4j.read(
      `MATCH (c1:Concept {documentId: $documentId})-[r]->(c2:Concept {documentId: $documentId}) RETURN c1.id as from, c2.id as to, type(r) as type`,
      { documentId },
    );

    this.logger.debug(`Found ${edgesResult.records.length} edges`);

    const edges = edgesResult.records.map((r) => ({
      from: r.get('from') as string,
      to: r.get('to') as string,
      type: r.get('type') as string,
    }));

    return { nodes, edges };
  }

  async addSubConceptRelation(
    parentId: string,
    childId: string,
  ): Promise<void> {
    const cypher = `
      MATCH (parent:Concept {id: $parentId})
      MATCH (child:Concept {id: $childId})
      MERGE (parent)-[:HAS_SUBCONCEPT]->(child)
    `;
    await this.neo4j.write(cypher, { parentId, childId });
  }

  async getSubConcepts(parentId: string): Promise<Concept[]> {
    const cypher = `
      MATCH (p:Concept {id: $parentId})-[:HAS_SUBCONCEPT]->(c:Concept)
      RETURN c
      ORDER BY c.name
    `;
    const result = await this.neo4j.read(cypher, { parentId });
    return result.records.map((r) => {
      const node = this.extractConceptNode(r);
      return new Concept(node.id, node.name, node.documentId, node.description);
    });
  }

  async findRelatedNotInSet(conceptIds: string[]): Promise<Concept[]> {
    const cypher = `
      MATCH (c:Concept)-[:RELATED_TO|DEPENDS_ON]-(n:Concept)
      WHERE c.id IN $ids AND NOT n.id IN $ids
      RETURN DISTINCT n AS c
      LIMIT 10
    `;
    const result = await this.neo4j.read(cypher, { ids: conceptIds });
    return result.records.map((r) => {
      const node = this.extractConceptNode(r);
      return new Concept(node.id, node.name, node.documentId, node.description);
    });
  }

  private extractConceptNode(record: Neo4jRecord): ConceptNode {
    const node = record.get('c') as Node;
    const props = node.properties as Neo4jConceptProperties;
    return {
      id: props.id,
      name: props.name,
      documentId: props.documentId,
      description: props.description,
    };
  }
}
