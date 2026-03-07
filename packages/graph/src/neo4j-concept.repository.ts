import { IConceptRepository, Concept } from '@sagepoint/domain';
import type { ConceptGraph } from '@sagepoint/domain';
import { Neo4jService } from './neo4j.service';
import { Injectable, Logger } from '@nestjs/common';
import type { Record as Neo4jRecord, Node } from 'neo4j-driver';

interface Neo4jConceptProperties {
  id: string;
  name: string;
  documentId?: string;
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
      documentId: concept.documentId || '',
    });
  }

  async saveWithRelations(
    concepts: Concept[],
    relationships: { fromId: string; toId: string; type: string }[],
    sourceId?: string,
    sourceType?: 'Document' | 'Roadmap',
  ): Promise<void> {
    const session = this.neo4j.getDriver().session();
    try {
      // Create source node if provided
      if (sourceId && sourceType) {
        await session.run(
          `MERGE (s:${sourceType} {id: $id})`,
          { id: sourceId },
        );
      }

      // MERGE concepts by ID, link same-name concepts with SAME_AS
      for (const concept of concepts) {
        await session.run(
          `
          MERGE (c:Concept {id: $id})
          SET c.name = $name, c.description = $description
          ${concept.documentId ? ', c.documentId = $documentId' : ''}
          WITH c
          OPTIONAL MATCH (existing:Concept)
          WHERE existing.id <> c.id AND toLower(existing.name) = toLower(c.name)
          FOREACH (_ IN CASE WHEN existing IS NOT NULL THEN [1] ELSE [] END |
            MERGE (c)-[:SAME_AS]->(existing)
          )
          `,
          {
            id: concept.id,
            name: concept.name,
            description: concept.description || '',
            documentId: concept.documentId || '',
          },
        );

        // Link to source
        if (sourceId && sourceType) {
          await session.run(
            `
            MATCH (s:${sourceType} {id: $sourceId})
            MATCH (c:Concept {id: $conceptId})
            MERGE (s)-[:CONTAINS]->(c)
            `,
            { sourceId, conceptId: concept.id },
          );
        }
      }

      // Create relationships
      for (const rel of relationships) {
        const relType = rel.type.toUpperCase().replace(/[^A-Z_]/g, '_');
        await session.run(
          `
          MATCH (a:Concept {id: $fromId})
          MATCH (b:Concept {id: $toId})
          MERGE (a)-[:${relType}]->(b)
          `,
          { fromId: rel.fromId, toId: rel.toId },
        );
      }

      this.logger.log(
        `Saved ${concepts.length} concepts with ${relationships.length} relationships to Neo4j`,
      );
    } finally {
      await session.close();
    }
  }

  async findById(id: string): Promise<Concept | null> {
    const cypher = `MATCH (c:Concept {id: $id}) RETURN c`;
    const result = await this.neo4j.read(cypher, { id });
    if (result.records.length === 0) return null;

    const node = this.extractConceptNode(result.records[0]);
    return new Concept(node.id, node.name, node.documentId, node.description);
  }

  async getGraphByDocumentId(documentId: string): Promise<ConceptGraph> {
    this.logger.debug(`Fetching graph for documentId: ${documentId}`);

    const nodesResult = await this.neo4j.read(
      `MATCH (c:Concept {documentId: $documentId}) RETURN c`,
      { documentId },
    );

    const nodes = nodesResult.records.map((r) => {
      const node = this.extractConceptNode(r);
      return new Concept(node.id, node.name, node.documentId, node.description);
    });

    const edgesResult = await this.neo4j.read(
      `MATCH (c1:Concept {documentId: $documentId})-[r]->(c2:Concept {documentId: $documentId})
       WHERE type(r) <> 'SAME_AS'
       RETURN c1.id as from, c2.id as to, type(r) as type`,
      { documentId },
    );

    const edges = edgesResult.records.map((r) => ({
      from: r.get('from') as string,
      to: r.get('to') as string,
      type: r.get('type') as string,
    }));

    return { nodes, edges };
  }

  async findRelatedConcepts(
    conceptNames: string[],
    limit = 20,
  ): Promise<ConceptGraph> {
    if (conceptNames.length === 0) return { nodes: [], edges: [] };

    const lowerNames = conceptNames.map((n) => n.toLowerCase());

    // Find existing concepts whose names contain any of the search terms
    const nodesResult = await this.neo4j.read(
      `
      MATCH (c:Concept)
      WHERE ANY(term IN $names WHERE toLower(c.name) CONTAINS term)
      RETURN c
      LIMIT $limit
      `,
      { names: lowerNames, limit },
    );

    if (nodesResult.records.length === 0) return { nodes: [], edges: [] };

    const nodes = nodesResult.records.map((r) => {
      const node = this.extractConceptNode(r);
      return new Concept(node.id, node.name, node.documentId, node.description);
    });

    const nodeIds = nodes.map((n) => n.id);

    // Fetch edges between found nodes
    const edgesResult = await this.neo4j.read(
      `
      MATCH (c1:Concept)-[r]->(c2:Concept)
      WHERE c1.id IN $ids AND c2.id IN $ids AND type(r) <> 'SAME_AS'
      RETURN c1.id as from, c2.id as to, type(r) as type
      `,
      { ids: nodeIds },
    );

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

  private extractConceptNode(record: Neo4jRecord): Neo4jConceptProperties {
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
